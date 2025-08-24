import { promises as fs } from 'fs';
import path from 'path';

const baseUrl = 'https://sreve.online';

async function getBlogPosts() {
  try {
    const postsDirectory = path.join(process.cwd(), 'public/blogs');
    const filenames = await fs.readdir(postsDirectory);
    
    return filenames
      .filter(name => name.endsWith('.html'))
      .map(name => ({
        slug: name.replace(/\.html$/, ''),
        lastModified: new Date().toISOString()
      }));
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

export async function GET() {
  const blogPosts = await getBlogPosts();
  
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.3
    }
  ];

  const blogRoutes = blogPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.lastModified,
    changeFrequency: 'monthly',
    priority: 0.6
  }));

  const allRoutes = [...staticRoutes, ...blogRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    },
  });
}