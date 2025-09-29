import { NextRequest, NextResponse } from 'next/server';

interface UrlMetadata {
  title?: string;
  image?: string;
  description?: string;
  url: string;
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 requests per minute per IP

// Cache for successful metadata fetches
const metadataCache = new Map<string, { data: UrlMetadata; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  record.count++;
  return false;
}

function getCachedMetadata(url: string): UrlMetadata | null {
  const cached = metadataCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Cache hit for URL: ${url}`);
    return cached.data;
  }
  if (cached) {
    metadataCache.delete(url);
  }
  return null;
}

function setCachedMetadata(url: string, data: UrlMetadata): void {
  metadataCache.set(url, { data, timestamp: Date.now() });
  console.log(`💾 Cached metadata for URL: ${url}`);
}

function decodeHtmlEntities(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x3D;': '=',
    '&#x60;': '`',
    '&#x5C;': '\\',
  };

  return str.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return htmlEntities[entity] || entity;
  });
}

export async function POST(request: NextRequest) {
  let url = '';
  try {
    const requestData = await request.json();
    url = requestData.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimitKey = getRateLimitKey(request);
    if (isRateLimited(rateLimitKey)) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${rateLimitKey}`);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check cache first
    const cachedMetadata = getCachedMetadata(url);
    if (cachedMetadata) {
      return NextResponse.json(cachedMetadata);
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP/HTTPS URLs are allowed' },
        { status: 400 }
      );
    }

    // Select appropriate User-Agent based on URL
    const isInstagram = url.includes('instagram.com');
    const userAgents = {
      instagram: [
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Mozilla/5.0 (compatible; Twitterbot/1.0; +https://dev.twitter.com/overview/terms/crawlers)',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      default: 'Mozilla/5.0 (compatible; Sreve/1.0; +https://sreve.ai)'
    };

    const selectedUserAgent = isInstagram
      ? userAgents.instagram[Math.floor(Math.random() * userAgents.instagram.length)]
      : userAgents.default;

    console.log(`🔍 Fetching metadata for URL: ${url} with User-Agent: ${selectedUserAgent.split(' ')[0]}...`);

    // Fetch the URL content with enhanced headers
    const headers: Record<string, string> = {
      'User-Agent': selectedUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Upgrade-Insecure-Requests': '1'
    };

    // Add Instagram-specific headers
    if (isInstagram) {
      headers['Referer'] = 'https://www.instagram.com/';
      headers['Origin'] = 'https://www.instagram.com';
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      // Set timeout to 15 seconds for Instagram
      signal: AbortSignal.timeout(isInstagram ? 15000 : 10000)
    });

    if (!response.ok) {
      console.warn(`❌ Failed to fetch URL: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const metadata: UrlMetadata = { url };

    // Extract Open Graph and fallback metadata
    const metaTags = html.match(/<meta[^>]+>/gi) || [];
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);

    

    // Extract og:title or fallback to title tag
    const ogTitle = metaTags.find((tag: string) =>
      tag.includes('property="og:title"') || tag.includes('name="og:title"')
    );
    if (ogTitle) {
      const titleContent = ogTitle.match(/content=["']([^"']+)["']/i);
      if (titleContent && titleContent[1]) {
        metadata.title = titleContent[1].trim();
      }
    } else if (titleMatch && titleMatch[1]) {
      metadata.title = titleMatch[1].trim();
    }

    // Extract og:description
    const ogDescription = metaTags.find((tag: string) =>
      tag.includes('property="og:description"') || tag.includes('name="description"')
    );
    if (ogDescription) {
      const descContent = ogDescription.match(/content=["']([^"']+)["']/i);
      if (descContent && descContent[1]) {
        metadata.description = descContent[1].trim();
      }
    }

    
    const ogImage = metaTags.find((tag: string) => {
      const lowerTag = tag.toLowerCase();
      return (
        lowerTag.includes('property="og:image"') ||
        lowerTag.includes("property='og:image'") ||
        lowerTag.includes('name="og:image"') ||
        lowerTag.includes("name='og:image'") ||
        lowerTag.includes('property=og:image') ||
        lowerTag.includes('name=og:image') ||
        lowerTag.includes('property="og:image:url"') ||
        lowerTag.includes("property='og:image:url'") ||
        lowerTag.includes('property=og:image:url')
      );
    });

    // Debug: Log all image-related meta tags
    const imageRelatedTags = metaTags.filter((tag: string) =>
      tag.toLowerCase().includes('image') ||
      tag.toLowerCase().includes('og:image') ||
      tag.toLowerCase().includes('twitter:image')
    );
    if (imageRelatedTags.length > 0) {
      console.log(`🖼️ All image-related meta tags found (${imageRelatedTags.length}):`);
      imageRelatedTags.forEach((tag, i) => {
        console.log(`  ${i + 1}: ${tag.substring(0, 200)}${tag.length > 200 ? '...' : ''}`);
      });
    }
    if (ogImage) {
      const imageContent = ogImage.match(/content=["']([^"']+)["']/i);
      if (imageContent && imageContent[1]) {
        let imageUrl = decodeHtmlEntities(imageContent[1].trim());

        // Handle relative URLs more robustly
        if (imageUrl.startsWith('//')) {
          // Protocol-relative URL
          imageUrl = `${validUrl.protocol}${imageUrl}`;
        } else if (imageUrl.startsWith('/')) {
          // Absolute path
          imageUrl = `${validUrl.protocol}//${validUrl.host}${imageUrl}`;
        } else if (imageUrl.startsWith('./')) {
          // Relative to current directory
          const basePath = validUrl.pathname.endsWith('/') ? validUrl.pathname : validUrl.pathname.split('/').slice(0, -1).join('/') + '/';
          imageUrl = `${validUrl.protocol}//${validUrl.host}${basePath}${imageUrl.slice(2)}`;
        } else if (imageUrl.startsWith('../')) {
          // Relative to parent directory
          const pathParts = validUrl.pathname.split('/').filter(part => part);
          const relativeParts = imageUrl.split('/');
          let upLevels = 0;

          for (const part of relativeParts) {
            if (part === '..') {
              upLevels++;
            } else {
              break;
            }
          }

          const remainingParts = relativeParts.slice(upLevels);
          const baseParts = pathParts.slice(0, -upLevels);
          const finalPath = '/' + [...baseParts, ...remainingParts].join('/');
          imageUrl = `${validUrl.protocol}//${validUrl.host}${finalPath}`;
        } else if (!imageUrl.startsWith('http')) {
          // Relative URL without prefix
          const basePath = validUrl.pathname.endsWith('/') ? validUrl.pathname : validUrl.pathname.split('/').slice(0, -1).join('/') + '/';
          imageUrl = `${validUrl.protocol}//${validUrl.host}${basePath}${imageUrl}`;
        }

        // Validate the resolved URL
        try {
          new URL(imageUrl);
          metadata.image = imageUrl;
          console.log(`🖼️ og:image found: original="${imageContent[1]}" → resolved="${imageUrl}"`);
        } catch {
          console.warn(`❌ Invalid og:image URL resolved: "${imageUrl}" from original: "${imageContent[1]}"`);
        }
      }
    }

    // If no og:image found, try twitter:image
    if (!metadata.image) {
      console.log(`🔍 No og:image found, searching for twitter:image`);
      const twitterImage = metaTags.find((tag: string) => {
        const lowerTag = tag.toLowerCase();
        return (
          lowerTag.includes('property="twitter:image"') ||
          lowerTag.includes("property='twitter:image'") ||
          lowerTag.includes('name="twitter:image"') ||
          lowerTag.includes("name='twitter:image'") ||
          lowerTag.includes('property=twitter:image') ||
          lowerTag.includes('name=twitter:image') ||
          lowerTag.includes('property="twitter:image:src"') ||
          lowerTag.includes("property='twitter:image:src'") ||
          lowerTag.includes('property=twitter:image:src')
        );
      });

      if (twitterImage) {
        const imageContent = twitterImage.match(/content=["']([^"']+)["']/i);
        if (imageContent && imageContent[1]) {
          let imageUrl = decodeHtmlEntities(imageContent[1].trim());

          // Handle relative URLs using the same logic as og:image
          if (imageUrl.startsWith('//')) {
            imageUrl = `${validUrl.protocol}${imageUrl}`;
          } else if (imageUrl.startsWith('/')) {
            imageUrl = `${validUrl.protocol}//${validUrl.host}${imageUrl}`;
          } else if (imageUrl.startsWith('./')) {
            const basePath = validUrl.pathname.endsWith('/') ? validUrl.pathname : validUrl.pathname.split('/').slice(0, -1).join('/') + '/';
            imageUrl = `${validUrl.protocol}//${validUrl.host}${basePath}${imageUrl.slice(2)}`;
          } else if (imageUrl.startsWith('../')) {
            const pathParts = validUrl.pathname.split('/').filter(part => part);
            const relativeParts = imageUrl.split('/');
            let upLevels = 0;

            for (const part of relativeParts) {
              if (part === '..') {
                upLevels++;
              } else {
                break;
              }
            }

            const remainingParts = relativeParts.slice(upLevels);
            const baseParts = pathParts.slice(0, -upLevels);
            const finalPath = '/' + [...baseParts, ...remainingParts].join('/');
            imageUrl = `${validUrl.protocol}//${validUrl.host}${finalPath}`;
          } else if (!imageUrl.startsWith('http')) {
            const basePath = validUrl.pathname.endsWith('/') ? validUrl.pathname : validUrl.pathname.split('/').slice(0, -1).join('/') + '/';
            imageUrl = `${validUrl.protocol}//${validUrl.host}${basePath}${imageUrl}`;
          }

          // Validate the resolved URL
          try {
            new URL(imageUrl);
            metadata.image = imageUrl;
            console.log(`🖼️ twitter:image found: original="${imageContent[1]}" → resolved="${imageUrl}"`);
          } catch {
            console.warn(`❌ Invalid twitter:image URL resolved: "${imageUrl}" from original: "${imageContent[1]}"`);
          }
        }
      }
    }

    // Try Instagram-specific patterns before falling back to img tags
    if (!metadata.image && isInstagram) {
      console.log(`🔍 Trying Instagram-specific patterns`);

      const instagramPatterns = [
        // Pattern 1: display_url in JSON data
        /"display_url":"([^"]+)"/,
        // Pattern 2: image_versions2 in GraphQL responses
        /"image_versions2":\{"candidates":\[.*?"url":"([^"]+)"/,
        // Pattern 3: thumbnail_src in shortcode media
        /"thumbnail_src":"([^"]+)"/,
        // Pattern 4: src attribute in main content image
        /"src":"([^"]+)"[^}]*"config_width":640/,
        // Pattern 5: Standard src in media JSON
        /"src":"([^"]+)"[^}]*"type":"image"/,
        // Pattern 6: EdgeMedia display_url
        /"edge_media_to_caption".*?"display_url":"([^"]+)"/,
        // Pattern 7: Profile picture patterns
        /"profile_pic_url":"([^"]+)"/,
        // Pattern 8: Story/highlight patterns
        /"display_resources":\[.*?"src":"([^"]+)"/
      ];

      for (let i = 0; i < instagramPatterns.length && !metadata.image; i++) {
        const pattern = instagramPatterns[i];
        const match = html.match(pattern);

        if (match && match[1]) {
          let instagramImageUrl = match[1]
            .replace(/\\u0026/g, '&')
            .replace(/\\\//g, '/')
            .replace(/\\/g, '');

          // Decode HTML entities (including &amp; to &)
          instagramImageUrl = decodeHtmlEntities(instagramImageUrl);

          // Additional URL decoding for any remaining percent-encoded characters
          try {
            instagramImageUrl = decodeURIComponent(instagramImageUrl);
          } catch {
            // If decoding fails, continue with the current string
            console.log(`⚠️ Failed to decode URL: ${instagramImageUrl}`);
          }

          // Skip profile pictures unless no other image found
          if (i === 6 && instagramImageUrl.includes('profile_pic')) {
            console.log(`⚠️ Skipping profile picture, looking for post content`);
            continue;
          }

          try {
            new URL(instagramImageUrl);
            metadata.image = instagramImageUrl;
            console.log(`🖼️ Instagram image found with pattern ${i + 1}: "${instagramImageUrl}"`);
            break;
          } catch {
            console.warn(`❌ Invalid Instagram image URL from pattern ${i + 1}: "${instagramImageUrl}"`);
          }
        }
      }

      // Fallback: Look for any large image URLs in Instagram's response
      if (!metadata.image) {
        console.log(`🔍 Trying Instagram fallback pattern search`);
        const urlMatches = html.match(/https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)[^"'\s]*/gi);
        if (urlMatches && urlMatches.length > 0) {
          // Find the largest image by looking for resolution indicators
          const sortedUrls = urlMatches
            .filter(url => !url.includes('profile_pic') && !url.includes('150x150'))
            .sort((a, b) => {
              const aRes = a.match(/(\d+)x(\d+)/);
              const bRes = b.match(/(\d+)x(\d+)/);
              if (aRes && bRes) {
                return (parseInt(bRes[1]) * parseInt(bRes[2])) - (parseInt(aRes[1]) * parseInt(aRes[2]));
              }
              return b.length - a.length; // Longer URLs often have higher quality
            });

          if (sortedUrls[0]) {
            try {
              const decodedUrl = decodeHtmlEntities(sortedUrls[0]);
              new URL(decodedUrl);
              metadata.image = decodedUrl;
              console.log(`🖼️ Instagram fallback image found: "${decodedUrl}"`);
            } catch {
              console.warn(`❌ Invalid Instagram fallback URL: "${sortedUrls[0]}"`);
            }
          }
        }
      }
    }

    // If no og:image or twitter:image found, try to find the first suitable image
    if (!metadata.image) {
      console.log(`🔍 No og:image or twitter:image found, searching for fallback images`);
      const imgTags = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
      console.log(`🖼️ Found ${imgTags.length} img tags, checking first 3`);
      for (const imgTag of imgTags.slice(0, 3)) { // Check first 3 images
        const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
        if (srcMatch && srcMatch[1]) {
          let imageUrl = decodeHtmlEntities(srcMatch[1].trim());

          // Skip very small images, icons, tracking pixels, or base64 images
          if (imageUrl && (
              imageUrl.includes('favicon') ||
              imageUrl.includes('icon') ||
              imageUrl.includes('logo') ||
              imageUrl.includes('1x1') ||
              imageUrl.includes('tracking') ||
              imageUrl.startsWith('data:') ||
              imageUrl.includes('base64') ||
              imageUrl.includes('placeholder') ||
              imageUrl.includes('blank') ||
              imageUrl.includes('spacer') ||
              imageUrl.length > 1000 // Skip very long URLs which are likely base64
            )) {
            continue;
          }

          // Handle relative URLs more robustly
          if (imageUrl.startsWith('//')) {
            // Protocol-relative URL
            imageUrl = `${validUrl.protocol}${imageUrl}`;
          } else if (imageUrl.startsWith('/')) {
            // Absolute path
            imageUrl = `${validUrl.protocol}//${validUrl.host}${imageUrl}`;
          } else if (imageUrl.startsWith('./')) {
            // Relative to current directory
            const basePath = validUrl.pathname.endsWith('/') ? validUrl.pathname : validUrl.pathname.split('/').slice(0, -1).join('/') + '/';
            imageUrl = `${validUrl.protocol}//${validUrl.host}${basePath}${imageUrl.slice(2)}`;
          } else if (imageUrl.startsWith('../')) {
            // Relative to parent directory
            const pathParts = validUrl.pathname.split('/').filter(part => part);
            const relativeParts = imageUrl.split('/');
            let upLevels = 0;

            for (const part of relativeParts) {
              if (part === '..') {
                upLevels++;
              } else {
                break;
              }
            }

            const remainingParts = relativeParts.slice(upLevels);
            const baseParts = pathParts.slice(0, -upLevels);
            const finalPath = '/' + [...baseParts, ...remainingParts].join('/');
            imageUrl = `${validUrl.protocol}//${validUrl.host}${finalPath}`;
          } else if (!imageUrl.startsWith('http')) {
            // Relative URL without prefix
            const basePath = validUrl.pathname.endsWith('/') ? validUrl.pathname : validUrl.pathname.split('/').slice(0, -1).join('/') + '/';
            imageUrl = `${validUrl.protocol}//${validUrl.host}${basePath}${imageUrl}`;
          }

          // Validate the resolved URL
          try {
            new URL(imageUrl);
            metadata.image = imageUrl;
            console.log(`🖼️ Fallback image found: original="${srcMatch[1]}" → resolved="${imageUrl}"`);
            break;
          } catch {
            console.warn(`❌ Invalid fallback image URL resolved: "${imageUrl}" from original: "${srcMatch[1]}"`);
            continue;
          }
        }
      }
    }

    console.log(`✅ Successfully extracted metadata:`, {
      url: metadata.url,
      hasTitle: !!metadata.title,
      hasImage: !!metadata.image,
      hasDescription: !!metadata.description
    });

    // Cache successful metadata
    setCachedMetadata(url, metadata);

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('❌ Error fetching URL metadata:', error);

    // Provide specific error messages for better debugging
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`⏱️ Request timeout for URL: ${url}`);
        return NextResponse.json(
          {
            error: 'Request timeout - the website took too long to respond',
            url,
            errorType: 'timeout'
          },
          { status: 408 }
        );
      }

      if (error.message.includes('fetch')) {
        console.warn(`🌐 Network error for URL: ${url}`);
        return NextResponse.json(
          {
            error: 'Network error - unable to connect to the website',
            url,
            errorType: 'network'
          },
          { status: 503 }
        );
      }

      if (error.message.includes('ENOTFOUND') || error.message.includes('DNS')) {
        console.warn(`🔍 DNS error for URL: ${url}`);
        return NextResponse.json(
          {
            error: 'Website not found - please check the URL',
            url,
            errorType: 'dns'
          },
          { status: 404 }
        );
      }
    }

    // Generic error fallback
    console.error(`💥 Unexpected error for URL: ${url}`, error);
    return NextResponse.json(
      {
        error: 'Unable to fetch website metadata. The website may be blocking automated requests.',
        url,
        errorType: 'unknown',
        suggestion: url.includes('instagram.com')
          ? 'Instagram posts may require the URL to be shared on social media first to generate preview data.'
          : 'Try again later or check if the website is accessible.'
      },
      { status: 500 }
    );
  }
}