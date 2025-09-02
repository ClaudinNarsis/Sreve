import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Get content for better description
  const content = await getPostContent(slug);
  const description = content 
    ? `${formattedTitle} - Expert insights on AI copywriting, marketing tools, and creative strategies for agencies and performance marketers.`
    : `${formattedTitle} - AI copywriting insights and marketing strategies from Sreve.`;
  
  return {
    title: formattedTitle,
    description,
    keywords: [
      'AI copywriting',
      'marketing agency tools',
      'creative AI',
      'ad copy generation',
      'performance marketing',
      'agency AI tools'
    ],
    openGraph: {
      title: `${formattedTitle} | Sreve Blog`,
      description,
      url: `https://sreve.online/blog/${slug}`,
      type: 'article',
      publishedTime: new Date().toISOString(),
      authors: ['Sreve Team'],
      images: [
        {
          url: '/assets/blog-og-image.png',
          width: 1200,
          height: 630,
          alt: formattedTitle,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${formattedTitle} | Sreve Blog`,
      description,
      images: ['/assets/blog-twitter-image.png'],
    },
    alternates: {
      canonical: `https://sreve.online/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const postsDirectory = path.join(process.cwd(), 'public/blogs');
    const filenames = await fs.readdir(postsDirectory);
    
    return filenames
      .filter(name => name.endsWith('.html'))
      .map(name => ({
        slug: name.replace(/\.html$/, '')
      }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

async function getPostContent(slug: string) {
  const filePath = path.join(process.cwd(), 'public/blogs', `${slug}.html`);
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = await getPostContent(slug);

  if (!content) return <div>Post not found</div>;

  const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <main>
      <div className="container">
        <Script id="breadcrumb-schema" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://sreve.online"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": "https://sreve.online/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": formattedTitle,
                "item": `https://sreve.online/blog/${slug}`
              }
            ]
          })}
        </Script>
        <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
          <ol style={{ display: 'flex', listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
            <li><Link href="/" style={{ color: '#ff6600' }}>Home</Link></li>
            <li style={{ margin: '0 0.5rem' }}>/</li>
            <li><Link href="/blog" style={{ color: '#ff6600' }}>Blog</Link></li>
            <li style={{ margin: '0 0.5rem' }}>/</li>
            <li style={{ color: '#ccc' }}>{slug.replace(/-/g, ' ')}</li>
          </ol>
        </nav>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Ready to Generate Creative Copy Like This?</h3>
          <p style={{ marginBottom: '1.5rem', color: '#ccc' }}>
            Join 500+ agencies using Sreve to create scroll-stopping ad copy and UGC scripts.
          </p>
          <Link href="/" style={{ 
            display: 'inline-block', 
            backgroundColor: '#ff6600', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Try Sreve Free →
          </Link>
        </div>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/blog" style={{ color: '#ff6600', textDecoration: 'underline' }}>
            ← Back to all posts
          </Link>
        </div>
      </div>
    </main>
  );
}