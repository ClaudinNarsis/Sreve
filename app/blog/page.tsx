
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
  const postsDirectory = path.join(process.cwd(), 'public/blogs');
  const filenames = await fs.readdir(postsDirectory);

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
    </main>
  );
}
