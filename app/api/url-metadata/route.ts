import { NextRequest, NextResponse } from 'next/server';

interface UrlMetadata {
  title?: string;
  image?: string;
  description?: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
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

    console.log(`🔍 Fetching metadata for URL: ${url}`);

    // Fetch the URL content
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Sreve/1.0; +https://sreve.ai)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      // Set timeout to 10 seconds
      signal: AbortSignal.timeout(10000)
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
        let imageUrl = imageContent[1].trim();

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
          let imageUrl = imageContent[1].trim();

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
    if (!metadata.image && url.includes('instagram.com')) {
      console.log(`🔍 Trying Instagram-specific patterns`);
      // Look for Instagram's image data in script tags or other patterns
      const instagramImageMatch = html.match(/"display_url":"([^"]+)"/);
      if (instagramImageMatch && instagramImageMatch[1]) {
        const instagramImageUrl = instagramImageMatch[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
        try {
          new URL(instagramImageUrl);
          metadata.image = instagramImageUrl;
          console.log(`🖼️ Instagram image found in script: "${instagramImageUrl}"`);
        } catch {
          console.warn(`❌ Invalid Instagram image URL: "${instagramImageUrl}"`);
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
          let imageUrl = srcMatch[1].trim();

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

    return NextResponse.json(metadata);

  } catch (error) {
    console.error('❌ Error fetching URL metadata:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}