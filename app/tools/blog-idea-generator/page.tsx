"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function BlogIdeaGeneratorPage() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 0) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          <Image src="/assets/logo.png" alt="Sreve Logo" className="logo" width={120} height={40} priority />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="/#features">Product</a>
          <Link href="/tools">Tools</Link>
          <a href="/#pricing">Pricing</a>
          <Link href="/blog">Blog</Link>
          <a href="/#contact-us">Contact Us</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button go-to-app-button" style={{ margin: 0, padding: '0.75rem 1.5rem' }}>Go to App</button>
            </Link>
            <UserButton  />
          </SignedIn>
        </div>
      </header>

      <section className="hero" style={{ minHeight: '70vh', paddingTop: '120px' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Blog Idea Generator - 
            <span style={{ color: '#ff6600' }}> Never Run Out of Content Ideas</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Generate endless blog post ideas with our AI-powered blog idea generator. Get trending topics, SEO-optimized 
            titles, and content angles that your audience will love. Perfect for bloggers, marketers, and content creators.
          </p>
          
          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>💡 Endless Ideas</h4>
              <p>Thousands of unique blog topics</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎯 SEO Optimized</h4>
              <p>Titles designed for search rankings</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📈 Trend-Based</h4>
              <p>Ideas based on current trends</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What niche or topic do you want blog ideas for?"></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Marketing blog ideas</button>
                  <button className="chip">Tech startup content</button>
                  <button className="chip">Fitness and wellness</button>
                  <button className="chip">Personal finance tips</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate Blog Ideas</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Generating Ideas</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="content-types-section" style={{ padding: '4rem 0', background: '# 1e1e1e' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Blog Ideas for Every Niche</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="niche-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>🏢 Business & Marketing</h4>
              <ul style={{ paddingLeft: '1rem' }}>
                <li>"How to Scale Your Startup in 2024"</li>
                <li>"Top Marketing Trends Every CMO Should Know"</li>
                <li>"The Complete Guide to Customer Retention"</li>
              </ul>
            </div>
            <div className="niche-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>💻 Technology & AI</h4>
              <ul style={{ paddingLeft: '1rem' }}>
                <li>"AI Tools That Are Changing Content Creation"</li>
                <li>"Cybersecurity Best Practices for Remote Teams"</li>
                <li>"The Future of Web Development in 2024"</li>
              </ul>
            </div>
            <div className="niche-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>🏥 Health & Wellness</h4>
              <ul style={{ paddingLeft: '1rem' }}>
                <li>"10 Science-Backed Ways to Boost Your Energy"</li>
                <li>"Mental Health Resources for Busy Professionals"</li>
                <li>"The Complete Guide to Mindful Eating"</li>
              </ul>
            </div>
            <div className="niche-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>🎨 Lifestyle & Personal</h4>
              <ul style={{ paddingLeft: '1rem' }}>
                <li>"Minimalist Living: A Beginner's Guide"</li>
                <li>"Time Management Hacks for Creative People"</li>
                <li>"Building Healthy Habits That Actually Stick"</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Features That Fuel Your Content Strategy
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🔍 SEO Keyword Integration</h3>
              <p>Get blog ideas with built-in SEO keywords to help your content rank higher in search results.</p>
            </article>
            <article className="feature">
              <h3>📊 Trending Topics</h3>
              <p>Access real-time trending topics and viral content ideas that your audience is actively searching for.</p>
            </article>
            <article className="feature">
              <h3>🎯 Audience-Specific Ideas</h3>
              <p>Generate ideas tailored to your specific audience demographics, interests, and pain points.</p>
            </article>
            <article className="feature">
              <h3>📝 Content Outlines</h3>
              <p>Get detailed blog outlines with suggested headings, subpoints, and content structure.</p>
            </article>
            <article className="feature">
              <h3>⚡ Bulk Generation</h3>
              <p>Generate hundreds of blog ideas at once to plan months of content in just minutes.</p>
            </article>
            <article className="feature">
              <h3>🔄 Content Refresh Ideas</h3>
              <p>Transform your existing content into fresh new blog posts with updated angles and insights.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="process-section" style={{ background: '# 1e1e1e', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>1. Enter Your Niche</h4>
              <p>Tell us your industry, target audience, or general topic area</p>
            </div>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>2. AI Analysis</h4>
              <p>Our AI analyzes trends, search data, and competitor content</p>
            </div>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>3. Get Ideas</h4>
              <p>Receive dozens of unique, engaging blog post ideas instantly</p>
            </div>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>4. Start Writing</h4>
              <p>Use our ideas as inspiration to create amazing content</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Loved by Content Creators</h2>
          <div className="grid">
            <article className="card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p3.jpeg" alt="Emma - Blogger" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Emma Thompson</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Lifestyle Blogger</p>
                </div>
              </div>
              <blockquote>"I went from struggling to find one blog idea per week to having a content calendar packed for months!"</blockquote>
            </article>
            <article className="card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p4.jpg" alt="David - Marketing Manager" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>David Chen</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Marketing Manager</p>
                </div>
              </div>
              <blockquote>"The SEO-optimized titles helped us increase our organic traffic by 300% in just 3 months."</blockquote>
            </article>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Never Run Out of Ideas?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Join thousands of successful bloggers and content creators.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Generate Blog Ideas Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Go to Idea Generator
              </button>
            </Link>
          </SignedIn>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <ul className="footer-nav">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Sreve. All rights reserved.</p>
        </div>
      </footer>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Blog Idea Generator - Sreve",
            "description": "Generate endless blog post ideas with SEO-optimized titles and trending topics for any niche or industry. Never run out of content ideas.",
            "url": "https://sreve.online/tools/blog-idea-generator",
            "applicationCategory": "Content Planning Software",
            "operatingSystem": "Web Browser",
            "author": {
              "@type": "Organization",
              "name": "Sreve"
            },
            "publisher": {
              "@type": "Organization", 
              "name": "Sreve",
              "logo": {
                "@type": "ImageObject",
                "url": "https://sreve.online/assets/logo.png"
              }
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "description": "Free unlimited blog idea generation"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1100",
              "bestRating": "5"
            },
            "featureList": [
              "SEO-optimized blog titles",
              "Trending topic analysis", 
              "Niche-specific ideas",
              "Content calendar planning",
              "Keyword integration",
              "Multiple format options"
            ]
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
                "name": "How does the Blog Idea Generator work?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply enter your niche, industry, or topic and our AI will generate dozens of blog post ideas with SEO-optimized titles, trending angles, and content suggestions."
                }
              },
              {
                "@type": "Question",
                "name": "Are the blog ideas SEO-optimized?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all generated blog ideas include SEO-friendly titles and keyword suggestions to help your content rank better in search engines."
                }
              },
              {
                "@type": "Question",
                "name": "Can I get ideas for any industry or niche?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! The Blog Idea Generator works for any industry, niche, or topic. Whether you're in tech, health, finance, or any other field, you'll get relevant, engaging ideas."
                }
              },
              {
                "@type": "Question",
                "name": "How many blog ideas can I generate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can generate unlimited blog ideas for free. Create as many content concepts as you need to build a comprehensive content calendar."
                }
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
                "name": "AI Tools",
                "item": "https://sreve.online/tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Blog Idea Generator",
                "item": "https://sreve.online/tools/blog-idea-generator"
              }
            ]
          })
        }}
      />
    </>
  );
}