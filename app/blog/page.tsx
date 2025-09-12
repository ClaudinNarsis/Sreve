
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - AI Copywriting Tips & Marketing Insights',
  description: 'Discover expert tips on AI copywriting, marketing strategies, and creative tools for agencies. Learn how to boost your performance marketing with AI.',
  keywords: [
    'AI copywriting blog',
    'marketing insights',
    'agency tips',
    'performance marketing',
    'creative tools',
    'ad copy strategies'
  ],
  openGraph: {
    title: 'Blog - AI Copywriting Tips & Marketing Insights | Sreve',
    description: 'Discover expert tips on AI copywriting, marketing strategies, and creative tools for agencies.',
    url: 'https://sreve.online/blog',
    type: 'website',
  },
  twitter: {
    title: 'Blog - AI Copywriting Tips & Marketing Insights | Sreve',
    description: 'Discover expert tips on AI copywriting, marketing strategies, and creative tools for agencies.',
  },
  alternates: {
    canonical: 'https://sreve.online/blog',
  },
};

export default async function BlogPage() {
  let filenames: string[] = [];
  
  try {
    const postsDirectory = path.join(process.cwd(), 'public/blogs');
    filenames = await fs.readdir(postsDirectory);
  } catch {
    console.log('No blogs directory found, showing only dynamic posts');
  }

  // Define dynamic blog posts
  const dynamicPosts = [
    {
      slug: 'cheaper-jasper-alternative-2025',
      title: 'Best Cheaper Jasper AI Alternative in 2025 - Save 90% on AI Copywriting',
      description: 'Discover why Sreve is the best affordable alternative to Jasper AI. Compare pricing, features, and see how agencies save $1,200+ yearly.',
      date: 'January 27, 2025',
      readTime: '8 min read',
      tags: ['AI Writing', 'Jasper Alternative', 'Cost Comparison']
    },
    {
      slug: 'top-5-tools-for-creative-and-marketing-agencies',
      title: 'Top 5 AI Tools for Creative & Marketing Agencies',
      description: 'Discover the top 5 AI tools for creative & marketing agencies. Learn how copy ai, ad copy tools, and agency ai platforms can boost performance marketing.',
      date: 'August 23, 2025',
      readTime: '5 min read',
      tags: ['AI Tools', 'Marketing Agencies', 'Performance Marketing']
    }
  ];

  return (
    <main>
        <div className="container">
            <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
              <ol style={{ display: 'flex', listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
                <li><Link href="/" style={{ color: '#ff6600' }}>Home</Link></li>
                <li style={{ margin: '0 0.5rem' }}>/</li>
                <li style={{ color: '#ccc' }}>Blog</li>
              </ol>
            </nav>
            <h1 className="blog-title">AI Copywriting Insights & Marketing Tips</h1>
            <p style={{ marginBottom: '2rem', color: '#ccc' }}>
              Discover expert strategies, tools, and insights to boost your creative marketing campaigns with AI.
            </p>
            
            {/* Dynamic blog posts */}
            <div className="blog-posts-section">
              <h2 style={{ marginBottom: '1.5rem', color: '#ddd' }}>Latest Articles</h2>
              <div className="blog-posts-grid">
                {dynamicPosts.map((post) => (
                  <article key={post.slug} className="blog-post-card">
                    <div className="post-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="post-tag">{tag}</span>
                      ))}
                    </div>
                    <h3 className="post-title">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="post-description">{post.description}</p>
                    <div className="post-meta">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Static blog posts from files */}
            {filenames.length > 0 && (
              <div className="blog-posts-section">
                <h2 style={{ marginBottom: '1.5rem', color: '#333', marginTop: '3rem' }}>More Articles</h2>
                <ul className="blog-post-list">
                    {filenames.map((filename) => {
                    const slug = filename.replace(/\.html$/, '');
                    return (
                        <li key={slug} className="blog-post-list-item">
                        <Link href={`/blog/${slug}`}>{slug.replace(/-/g, ' ')}</Link>
                        </li>
                    );
                    })}
                </ul>
              </div>
            )}
        </div>
    </main>
  );
}
