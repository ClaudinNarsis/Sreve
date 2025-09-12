"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function AIContentGeneratorPage() {
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
            AI Content Generator - 
            <span style={{ color: '#ff6600' }}> Create High-Quality Content Instantly</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Generate compelling articles, blog posts, web copy, and marketing content with our advanced AI content generator. 
            Create long-form content that engages your audience and drives results in minutes, not hours.
          </p>
          
          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📄 Long-Form Content</h4>
              <p>Articles, blogs, and reports</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎯 Brand-Aligned</h4>
              <p>Content in your unique voice</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>⚡ Lightning Fast</h4>
              <p>Generate 1000+ words in minutes</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What type of content do you want to create?"></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Write a blog article about SEO</button>
                  <button className="chip">Create email marketing copy</button>
                  <button className="chip">Product description for e-commerce</button>
                  <button className="chip">Landing page content</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate Content</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Creating Content</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="content-types-section" style={{ padding: '4rem 0', background: '# 131313' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Generate Any Type of Content</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="content-type-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>📰</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center' }}>Blog Articles</h4>
              <p style={{ textAlign: 'center' }}>In-depth blog posts, thought leadership articles, and SEO-optimized content that ranks</p>
            </div>
            <div className="content-type-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🌐</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center' }}>Website Copy</h4>
              <p style={{ textAlign: 'center' }}>Landing pages, product descriptions, about pages, and conversion-focused web content</p>
            </div>
            <div className="content-type-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>📧</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center' }}>Email Campaigns</h4>
              <p style={{ textAlign: 'center' }}>Email sequences, newsletters, and promotional content that drives engagement</p>
            </div>
            <div className="content-type-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>📊</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center' }}>Marketing Content</h4>
              <p style={{ textAlign: 'center' }}>Ad copy, sales pages, press releases, and promotional materials that convert</p>
            </div>
            <div className="content-type-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>📋</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center' }}>Business Documents</h4>
              <p style={{ textAlign: 'center' }}>Proposals, reports, white papers, and professional documentation</p>
            </div>
            <div className="content-type-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🎓</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem', textAlign: 'center' }}>Educational Content</h4>
              <p style={{ textAlign: 'center' }}>Course materials, tutorials, how-to guides, and educational resources</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Advanced AI Content Creation Features
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🧠 Advanced AI Models</h3>
              <p>Powered by the latest AI technology that understands context, tone, and industry-specific requirements.</p>
            </article>
            <article className="feature">
              <h3>🎨 Custom Brand Voice</h3>
              <p>Train the AI to match your brand's unique voice, style, and messaging for consistent content.</p>
            </article>
            <article className="feature">
              <h3>📚 Research Integration</h3>
              <p>Generate content backed by real data, statistics, and current market insights.</p>
            </article>
            <article className="feature">
              <h3>🔍 SEO Optimization</h3>
              <p>Built-in SEO features that help your content rank higher in search engine results.</p>
            </article>
            <article className="feature">
              <h3>📝 Content Outlines</h3>
              <p>Generate detailed content outlines and structures before writing the full piece.</p>
            </article>
            <article className="feature">
              <h3>⚡ Bulk Content Creation</h3>
              <p>Generate multiple pieces of content simultaneously to scale your content production.</p>
            </article>
            <article className="feature">
              <h3>🔄 Content Variations</h3>
              <p>Create multiple versions of the same content for A/B testing and different audiences.</p>
            </article>
            <article className="feature">
              <h3>📊 Performance Analytics</h3>
              <p>Track how your AI-generated content performs and optimize for better results.</p>
            </article>
            <article className="feature">
              <h3>🌐 Multi-Language Support</h3>
              <p>Generate content in multiple languages to reach global audiences effectively.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="process-section" style={{ background: '# 131313', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How Our AI Content Generator Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>1. Describe Your Content</h4>
              <p>Tell us what you want to create - topic, tone, audience, and key points</p>
            </div>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>2. AI Research & Planning</h4>
              <p>Our AI researches your topic and creates a strategic content outline</p>
            </div>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>3. Generate Content</h4>
              <p>High-quality, engaging content is created in your brand's voice</p>
            </div>
            <div className="process-step" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>4. Review & Refine</h4>
              <p>Edit, customize, and perfect your content before publishing</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Trusted by Content Teams Worldwide</h2>
          <div className="grid">
            <article className="card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p1.jpg" alt="Marketing Director" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Jennifer Lee</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Marketing Director, TechCorp</p>
                </div>
              </div>
              <blockquote>"We've increased our content output by 400% while maintaining quality. This AI content generator is a game-changer for our marketing team."</blockquote>
            </article>
            <article className="card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p2.jpeg" alt="Content Manager" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Alex Thompson</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Content Manager, GrowthCo</p>
                </div>
              </div>
              <blockquote>"The quality is incredible - it's like having a team of expert writers available 24/7. Our blog traffic has tripled since we started using this tool."</blockquote>
            </article>
            <article className="card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p3.jpeg" alt="Freelance Writer" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Maria Rodriguez</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Freelance Writer</p>
                </div>
              </div>
              <blockquote>"As a freelancer, this tool has allowed me to take on 3x more projects. The content is so good, clients think I have a whole team working with me."</blockquote>
            </article>
          </div>
        </div>
      </section>

      <section className="pricing-preview" style={{ background: '# 131313', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Start Creating Professional Content Today</h2>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>✅ No credit card required</p>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>✅ Generate up to 20 pieces of content for free</p>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>✅ Cancel anytime</p>
          </div>
        </div>
      </section>

      <section className="related-tools" style={{ background: '#f8f9fa', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Boost Your Content Strategy</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <Link href="/tools/ai-caption-generator" style={{ textDecoration: 'none' }}>
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
                <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>📱 AI Caption Generator</h3>
                <p style={{ color: '#333', marginBottom: '1rem' }}>Create engaging captions to promote your content on social media</p>
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
                <p style={{ color: '#333', marginBottom: '1rem' }}>Never run out of content topics with endless blog post ideas</p>
                <span style={{ color: '#ff6600', fontWeight: 'bold' }}>Try Now →</span>
              </div>
            </Link>
            <Link href="/tools/ai-sentence-rewriter" style={{ textDecoration: 'none' }}>
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
                <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>✏️ AI Sentence Rewriter</h3>
                <p style={{ color: '#333', marginBottom: '1rem' }}>Perfect your content by rewriting and improving sentences</p>
                <span style={{ color: '#ff6600', fontWeight: 'bold' }}>Try Now →</span>
              </div>
            </Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem' }}>
              Learn more about AI copywriting: <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: '#ff6600', textDecoration: 'underline' }}>Best Jasper AI alternatives for content creation</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Transform Your Content Creation?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Join 50,000+ businesses using AI to create better content faster.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Start Creating Content Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Go to Content Generator
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