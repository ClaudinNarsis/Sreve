
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
      slug: 'create-viral-posts-with-ai',
      title: 'Create Viral Posts with AI: Best Tools & Strategies for 2025',
      description: 'Discover the best AI tools to create and validate viral social media posts. Learn proven strategies and techniques used by top marketers to maximize engagement.',
      date: 'January 15, 2025',
      readTime: '12 min read',
      tags: ['Viral Content', 'AI Tools', 'Social Media']
    },
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
    },
    {
      slug: 'ai-tools-social-media-marketing-2025',
      title: '10 Best AI Tools for Social Media Marketing in 2025',
      description: 'Discover the top AI tools for social media marketing in 2025. Create viral content, optimize posting schedules, and boost engagement with these powerful AI solutions.',
      date: 'February 15, 2025',
      readTime: '12 min read',
      tags: ['Social Media', 'AI Tools', 'Marketing Automation']
    },
    {
      slug: 'best-ai-tools-content-marketing-2025',
      title: 'Best AI Tools for Content Marketing 2025 - Complete Guide',
      description: 'Transform your content strategy with the top AI tools of 2025. Comprehensive guide to AI content creation, automation, and marketing tools.',
      date: 'March 5, 2025',
      readTime: '15 min read',
      tags: ['Content Marketing', 'AI Tools', 'Marketing Strategy']
    }
  ];

  return (
    <>
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
              Compare <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: '#ff6600', textDecoration: 'underline' }}>Sreve vs Jasper AI</Link> and 
              explore our <Link href="/tools" style={{ color: '#ff6600', textDecoration: 'underline' }}>complete AI toolkit</Link> for marketers.
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

    <footer className="footer" style={{ background: 'var(--darkness-level-1)', padding: '4rem 0 1rem' }}>
      <div className="footer-content">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            
            {/* Latest Blog Posts */}
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Latest Marketing Guides</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/blog/create-viral-posts-with-ai" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Create Viral Posts with AI</Link></li>
                <li><Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Jasper AI Alternative Guide</Link></li>
                <li><Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Top 5 AI Tools for Agencies</Link></li>
                <li><Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Social Media AI Tools 2025</Link></li>
                <li><Link href="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>All Blog Posts</Link></li>
              </ul>
            </div>

            {/* AI Tools Section */}
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>AI Content Creation Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/tools/ai-caption-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Caption Generator</Link></li>
                <li><Link href="/tools/ai-content-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Content Generator</Link></li>
                <li><Link href="/tools/blog-idea-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Blog Idea Generator</Link></li>
                <li><Link href="/tools/social-media-post-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Social Media Post Generator</Link></li>
                <li><Link href="/tools/ai-sentence-rewriter" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Sentence Rewriter</Link></li>
                <li><Link href="/tools" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>All AI Tools</Link></li>
              </ul>
            </div>

            {/* Marketing Topics */}
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Marketing Topics</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Tool Comparisons</Link></li>
                <li><Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Social Media Marketing</Link></li>
                <li><Link href="/blog/best-ai-tools-content-marketing-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Content Marketing</Link></li>
                <li><Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Agency Tools</Link></li>
                <li><a href="/#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing & Plans</a></li>
              </ul>
            </div>

            {/* Company & Support */}
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Company & Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>About Sreve</Link></li>
                <li><a href="/#contact-us" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact Us</a></li>
                <li><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>WhatsApp Support</a></li>
                <li><Link href="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link></li>
                <li><a href="/#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Product Demo</a></li>
                <li><a href="/#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Free Trial</a></li>
              </ul>
            </div>

          </div>

          {/* Popular Articles Section */}
          <div style={{ borderTop: '1px solid var(--darkness-level-3)', paddingTop: '2rem', marginTop: '2rem' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Most Popular Marketing Articles</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem 2rem' }}>
              <Link href="/blog/create-viral-posts-with-ai" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Create Viral Posts with AI</Link>
              <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Save 90% vs Jasper AI</Link>
              <Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Social Media AI Tools</Link>
              <Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Agency AI Tools Guide</Link>
              <Link href="/blog/best-ai-tools-content-marketing-2025" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Content Marketing AI</Link>
              <Link href="/tools/ai-caption-generator" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>AI Caption Generator</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom" style={{ borderTop: '1px solid var(--darkness-level-3)', paddingTop: '2rem', marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>© 2024 Sreve. All rights reserved. Your go-to resource for AI marketing insights and cost-effective alternatives.</p>
      </div>
    </footer>

    {/* Schema.org Structured Data */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Sreve AI Marketing Blog",
          "description": "Expert insights on AI copywriting, marketing strategies, and performance marketing tools. Learn how to boost your marketing campaigns with AI.",
          "url": "https://sreve.online/blog",
          "publisher": {
            "@type": "Organization",
            "name": "Sreve",
            "logo": {
              "@type": "ImageObject",
              "url": "https://sreve.online/assets/logo.png",
              "width": 120,
              "height": 40
            }
          },
          "blogPost": [
            {
              "@type": "BlogPosting",
              "headline": "Create Viral Posts with AI: Best Tools & Strategies for 2025",
              "description": "Discover the best AI tools to create and validate viral social media posts. Learn proven strategies and techniques used by top marketers to maximize engagement.",
              "url": "https://sreve.online/blog/create-viral-posts-with-ai",
              "datePublished": "2025-01-15",
              "author": {
                "@type": "Organization",
                "name": "Sreve"
              },
              "keywords": ["Viral Content", "AI Tools", "Social Media", "Viral Marketing"]
            },
            {
              "@type": "BlogPosting",
              "headline": "Best Cheaper Jasper AI Alternative in 2025 - Save 90% on AI Copywriting",
              "description": "Discover why Sreve is the best affordable alternative to Jasper AI. Compare pricing, features, and see how agencies save $1,200+ yearly.",
              "url": "https://sreve.online/blog/cheaper-jasper-alternative-2025",
              "datePublished": "2025-01-27",
              "author": {
                "@type": "Organization",
                "name": "Sreve"
              },
              "keywords": ["AI Writing", "Jasper Alternative", "Cost Comparison", "Marketing AI"]
            },
            {
              "@type": "BlogPosting", 
              "headline": "Top 5 AI Tools for Creative & Marketing Agencies",
              "description": "Discover the top 5 AI tools for creative & marketing agencies. Learn how copy ai, ad copy tools, and agency ai platforms can boost performance marketing.",
              "url": "https://sreve.online/blog/top-5-tools-for-creative-and-marketing-agencies",
              "datePublished": "2025-08-23",
              "author": {
                "@type": "Organization",
                "name": "Sreve"
              },
              "keywords": ["AI Tools", "Marketing Agencies", "Performance Marketing"]
            },
            {
              "@type": "BlogPosting",
              "headline": "10 Best AI Tools for Social Media Marketing in 2025",
              "description": "Discover the top AI tools for social media marketing in 2025. Create viral content, optimize posting schedules, and boost engagement.",
              "url": "https://sreve.online/blog/ai-tools-social-media-marketing-2025",
              "datePublished": "2025-02-15",
              "author": {
                "@type": "Organization",
                "name": "Sreve"
              },
              "keywords": ["Social Media", "AI Tools", "Marketing Automation"]
            },
            {
              "@type": "BlogPosting",
              "headline": "Best AI Tools for Content Marketing 2025 - Complete Guide",
              "description": "Transform your content strategy with the top AI tools of 2025. Comprehensive guide to AI content creation, automation, and marketing tools.",
              "url": "https://sreve.online/blog/best-ai-tools-content-marketing-2025",
              "datePublished": "2025-03-05",
              "author": {
                "@type": "Organization",
                "name": "Sreve"
              },
              "keywords": ["Content Marketing", "AI Tools", "Marketing Strategy"]
            }
          ]
        })
      }}
    />

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "AI Marketing Blog - Sreve",
          "description": "Comprehensive guides on AI marketing tools, cost comparisons, and performance marketing strategies.",
          "url": "https://sreve.online/blog",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Marketing Blog Posts",
            "description": "Expert articles on AI tools, marketing automation, and business growth strategies",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Article",
                  "name": "Create Viral Posts with AI: Best Tools & Strategies for 2025",
                  "url": "https://sreve.online/blog/create-viral-posts-with-ai"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "Article",
                  "name": "Best Cheaper Jasper AI Alternative in 2025",
                  "url": "https://sreve.online/blog/cheaper-jasper-alternative-2025"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "Article",
                  "name": "Top 5 AI Tools for Creative & Marketing Agencies",
                  "url": "https://sreve.online/blog/top-5-tools-for-creative-and-marketing-agencies"
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "Article",
                  "name": "10 Best AI Tools for Social Media Marketing in 2025",
                  "url": "https://sreve.online/blog/ai-tools-social-media-marketing-2025"
                }
              },
              {
                "@type": "ListItem",
                "position": 5,
                "item": {
                  "@type": "Article",
                  "name": "Best AI Tools for Content Marketing 2025",
                  "url": "https://sreve.online/blog/best-ai-tools-content-marketing-2025"
                }
              }
            ]
          },
          "breadcrumb": {
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
              }
            ]
          }
        })
      }}
    />

    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What topics does the Sreve blog cover?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The Sreve blog covers AI marketing tools, cost comparisons with competitors like Jasper AI, social media marketing strategies, content marketing automation, and performance marketing tips for agencies and businesses."
              }
            },
            {
              "@type": "Question",
              "name": "How can I save money on AI writing tools?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Read our detailed comparison guides showing how Sreve saves 90% compared to Jasper AI, Copy.ai, and other expensive alternatives while delivering the same quality results for marketing content creation."
              }
            },
            {
              "@type": "Question",
              "name": "Are these blog articles helpful for marketing agencies?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our blog specifically focuses on marketing agencies and performance marketers. We provide actionable insights, tool comparisons, and strategies that agencies use to scale their client work efficiently."
              }
            }
          ]
        })
      }}
    />
    </>
  );
}
