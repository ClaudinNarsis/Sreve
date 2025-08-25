"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import './tools.css';

export default function ToolsPage() {
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

  const tools = [
    {
      title: 'AI Sentence Rewriter Tool',
      description: 'Transform your sentences with advanced AI. Improve clarity, change tone, and enhance readability instantly.',
      href: '/tools/ai-sentence-rewriter',
      icon: '✏️'
    },
    {
      title: 'AI Caption Generator',
      description: 'Create engaging captions for Instagram, TikTok, LinkedIn, and more. Perfect for social media managers.',
      href: '/tools/ai-caption-generator',
      icon: '📱'
    },
    {
      title: 'Blog Idea Generator',
      description: 'Generate endless blog post ideas with SEO-optimized titles and trending topics for any niche.',
      href: '/tools/blog-idea-generator',
      icon: '💡'
    },
    {
      title: 'AI Content Generator',
      description: 'Create high-quality articles, blog posts, and marketing content in minutes with our advanced AI.',
      href: '/tools/ai-content-generator',
      icon: '📄'
    },
    {
      title: 'Social Media Post Generator',
      description: 'Generate viral social media posts for all platforms. Drive engagement and grow your audience.',
      href: '/tools/social-media-post-generator',
      icon: '🚀'
    }
  ];

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
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <section className="hero" style={{ minHeight: '50vh', paddingTop: '120px' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
            AI Tools for 
            <span style={{ color: '#ff6600' }}> Content Creation</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem' }}>
            Discover our collection of AI-powered tools designed to supercharge your content creation workflow. 
            From sentence rewriting to social media posts, we've got everything you need.
          </p>
          
          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What type of content do you want to create?"></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Rewrite this sentence for clarity</button>
                  <button className="chip">Generate Instagram captions for my product</button>
                  <button className="chip">Give me blog ideas for marketing</button>
                  <button className="chip">Create social media posts</button>
                </div>
              </div>
              
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Try Our AI Tools</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Creating</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="tools-grid-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {tools.map((tool, index) => (
              <Link href={tool.href} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tool-card" style={{ 
                  background: 'white', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                  border: '1px solid #f0f0f0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
                    {tool.icon}
                  </div>
                  <h3 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center', fontSize: '1.4rem' }}>
                    {tool.title}
                  </h3>
                  <p style={{ flex: 1, textAlign: 'center', lineHeight: '1.6' }}>
                    {tool.description}
                  </p>
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <span style={{ 
                      color: '#ff6600', 
                      fontWeight: 'bold',
                      textDecoration: 'underline'
                    }}>
                      Try Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center', background: '#f8f9fa' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Supercharge Your Content Creation?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Try any of our AI tools for free and see the difference quality AI makes.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Go to App
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
    </>
  );
}