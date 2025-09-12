"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function AICaptionGeneratorPage() {
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
            AI Caption Generator - 
            <span style={{ color: '#ff6600' }}> Create Engaging Social Media Captions</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Generate captivating captions for Instagram, TikTok, LinkedIn, and more. Our AI understands your brand voice 
            and creates scroll-stopping captions that drive engagement and boost your social media presence.
          </p>
          
          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📱 All Platforms</h4>
              <p>Instagram, TikTok, LinkedIn, Twitter</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎭 Brand Voice</h4>
              <p>Matches your unique tone and style</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>⚡ Instant Generation</h4>
              <p>Multiple captions in seconds</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="Describe your post or product for caption generation..."></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Instagram fashion post</button>
                  <button className="chip">LinkedIn business update</button>
                  <button className="chip">TikTok funny video</button>
                  <button className="chip">Product launch announcement</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate Captions</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Creating Captions</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="platforms-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect Captions for Every Platform</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="platform-card" style={{  padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Instagram</h4>
              <p>Engaging captions with trending hashtags for maximum reach and engagement</p>
            </div>
            <div className="platform-card" style={{  padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>TikTok</h4>
              <p>Viral-worthy captions that capture attention and encourage shares</p>
            </div>
            <div className="platform-card" style={{  padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>LinkedIn</h4>
              <p>Professional captions that build authority and drive business connections</p>
            </div>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐦</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Twitter</h4>
              <p>Concise, witty captions optimized for retweets and conversations</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Features That Drive Results
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🎯 Smart Hashtag Suggestions</h3>
              <p>Get trending and relevant hashtags automatically included in your captions to maximize discoverability.</p>
            </article>
            <article className="feature">
              <h3>🔥 Engagement-Optimized</h3>
              <p>Captions designed to generate likes, comments, and shares based on proven social media psychology.</p>
            </article>
            <article className="feature">
              <h3>⏰ Time-Saving Bulk Generation</h3>
              <p>Create multiple caption variations at once to plan weeks of content in just minutes.</p>
            </article>
            <article className="feature">
              <h3>🎨 Multiple Tone Options</h3>
              <p>Choose from funny, inspirational, professional, casual, or any custom tone that matches your brand.</p>
            </article>
            <article className="feature">
              <h3>📊 Character Count Optimization</h3>
              <p>Perfect length for each platform - never too long or too short for optimal engagement.</p>
            </article>
            <article className="feature">
              <h3>🚀 Call-to-Action Integration</h3>
              <p>Built-in CTAs that drive traffic, sales, and meaningful audience actions.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="testimonial-section" style={{ background: '#1f1f1f', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Loved by Social Media Managers</h2>
          <div className="grid">
            <article className="card" style={{ padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p1.jpg" alt="Sarah - Social Media Manager" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Sarah Johnson</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Social Media Manager</p>
                </div>
              </div>
              <blockquote>"This caption generator is a game-changer! Our engagement rates increased by 150% after using Sreve's AI captions."</blockquote>
            </article>
            <article className="card" style={{  padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p2.jpeg" alt="Mike - Content Creator" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Mike Rodriguez</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Content Creator</p>
                </div>
              </div>
              <blockquote>"I save 3 hours every day on caption writing. The AI understands my brand voice perfectly!"</blockquote>
            </article>
          </div>
        </div>
      </section>

      <section className="related-tools" style={{ background: '#f8f9fa', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Complete Your Content Strategy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <Link href="/tools/ai-content-generator" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>📄 AI Content Generator</h3>
                <p style={{ color: '#333', marginBottom: '1rem' }}>Create full blog posts and articles to pair with your captions</p>
                <span style={{ color: '#ff6600', fontWeight: 'bold' }}>Try Now →</span>
              </div>
            </Link>
            <Link href="/tools/social-media-post-generator" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🚀 Social Media Post Generator</h3>
                <p style={{ color: '#333', marginBottom: '1rem' }}>Generate complete social posts beyond just captions</p>
                <span style={{ color: '#ff6600', fontWeight: 'bold' }}>Try Now →</span>
              </div>
            </Link>
            <Link href="/tools/blog-idea-generator" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>💡 Blog Idea Generator</h3>
                <p style={{ color: '#333', marginBottom: '1rem' }}>Find content topics to create captions around</p>
                <span style={{ color: '#ff6600', fontWeight: 'bold' }}>Try Now →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Create Viral Captions?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Join 10,000+ creators and brands using our AI caption generator.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Start Creating Captions Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Go to Caption Generator
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
            "name": "AI Caption Generator",
            "description": "Create engaging social media captions for Instagram, TikTok, LinkedIn, and more. Generate viral-worthy captions that drive engagement and boost your social media presence.",
            "url": "https://sreve.online/tools/ai-caption-generator",
            "applicationCategory": "Social Media Marketing Software",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "price": "0",
                "priceCurrency": "USD",
                "name": "Free Plan"
              }
            },
            "provider": {
              "@type": "Organization",
              "name": "Sreve",
              "url": "https://sreve.online"
            },
            "featureList": [
              "Instagram caption generation",
              "TikTok caption creation",
              "LinkedIn post captions",
              "Twitter/X optimized content",
              "Hashtag suggestions",
              "Brand voice consistency",
              "Engagement optimization",
              "Multiple caption variations"
            ],
            "audience": {
              "@type": "Audience",
              "audienceType": "Social Media Managers, Content Creators, Marketing Agencies"
            },
            "softwareVersion": "2024.1",
            "datePublished": "2024-01-01",
            "dateModified": "2025-01-12",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "150",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": "Sarah Johnson"
                },
                "reviewBody": "This caption generator is a game-changer! Our engagement rates increased by 150% after using Sreve's AI captions.",
                "datePublished": "2024-12-15"
              },
              {
                "@type": "Review",
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "author": {
                  "@type": "Person",
                  "name": "Mike Rodriguez"
                },
                "reviewBody": "I save 3 hours every day on caption writing. The AI understands my brand voice perfectly!",
                "datePublished": "2024-12-10"
              }
            ],
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
                  "name": "AI Tools",
                  "item": "https://sreve.online/tools"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "AI Caption Generator",
                  "item": "https://sreve.online/tools/ai-caption-generator"
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
            "@type": "HowTo",
            "name": "How to Create Engaging Social Media Captions with AI",
            "description": "Step-by-step guide to creating viral social media captions using Sreve's AI Caption Generator",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Describe Your Content",
                "text": "Enter details about your post, product, or message you want to share",
                "url": "https://sreve.online/tools/ai-caption-generator#step1"
              },
              {
                "@type": "HowToStep",
                "name": "Choose Platform and Tone",
                "text": "Select your target platform (Instagram, TikTok, LinkedIn) and desired tone",
                "url": "https://sreve.online/tools/ai-caption-generator#step2"
              },
              {
                "@type": "HowToStep",
                "name": "Generate Multiple Options",
                "text": "AI creates several caption variations optimized for engagement",
                "url": "https://sreve.online/tools/ai-caption-generator#step3"
              },
              {
                "@type": "HowToStep",
                "name": "Customize and Post",
                "text": "Edit the generated caption to match your brand voice and publish",
                "url": "https://sreve.online/tools/ai-caption-generator#step4"
              }
            ],
            "totalTime": "PT2M",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "USD",
              "value": "0"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Content idea or product description"
              },
              {
                "@type": "HowToSupply",
                "name": "Target audience information"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Sreve AI Caption Generator",
                "url": "https://sreve.online/tools/ai-caption-generator"
              }
            ]
          })
        }}
      />
    </>
  );
}