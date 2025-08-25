"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function SocialMediaPostGeneratorPage() {
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
            Social Media Post Generator - 
            <span style={{ color: '#ff6600' }}> Create Viral Posts in Seconds</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Generate engaging social media posts for all platforms with our AI social media post generator. Create viral content 
            that drives engagement, builds your audience, and grows your brand across Instagram, Facebook, LinkedIn, and more.
          </p>
          
          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🚀 Viral Content</h4>
              <p>Posts designed to go viral</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📱 Multi-Platform</h4>
              <p>Optimized for every platform</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>⏰ Save Time</h4>
              <p>Create weeks of content instantly</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What do you want to post about on social media?"></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Motivational Monday post</button>
                  <button className="chip">Product showcase for Instagram</button>
                  <button className="chip">LinkedIn thought leadership</button>
                  <button className="chip">Behind-the-scenes content</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate Posts</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Creating Posts</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="platforms-showcase" style={{ padding: '4rem 0', background: '#  1e1e1e' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect Posts for Every Platform</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(300px, 1fr))', gap: '2rem' }}>
            <div className="platform-showcase" style={{    padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>📸</div>
                <h4 style={{ color: '#ff6600', margin: 0 }}>Instagram Posts</h4>
              </div>
              <div style={{ background: '#  1e1e1e', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>
                  "Just discovered the secret to perfect morning coffee ☕✨ Who else can't function without their daily brew? 
                  #MorningRitual #CoffeeLovers #LifeHacks"
                </p>
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Engaging captions with trending hashtags and emojis</p>
            </div>

            <div className="platform-showcase" style={{    padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>💼</div>
                <h4 style={{ color: '#ff6600', margin: 0 }}>LinkedIn Updates</h4>
              </div>
              <div style={{ background: '#  1e1e1e', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>
                  "The future of remote work isn't just about flexibility—it's about building stronger, more inclusive teams. 
                  What's your take on the evolution of workplace culture? 💭"
                </p>
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Professional content that sparks meaningful conversations</p>
            </div>

            <div className="platform-showcase" style={{    padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>🎵</div>
                <h4 style={{ color: '#ff6600', margin: 0 }}>TikTok Content</h4>
              </div>
              <div style={{ background: '#  1e1e1e', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <p style={{ fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>
                  "POV: You finally found the perfect productivity hack 🎯 Try this 2-minute rule and thank me later! 
                  #ProductivityTips #LifeHacks #Trending"
                </p>
              </div>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Viral-worthy content with trending hooks and CTAs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Features That Drive Engagement
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🎯 Platform-Specific Optimization</h3>
              <p>Each post is tailored for the specific platform's algorithm, format, and audience behavior.</p>
            </article>
            <article className="feature">
              <h3>📈 Engagement-Driven Content</h3>
              <p>Posts designed using proven psychology and engagement tactics to maximize likes, shares, and comments.</p>
            </article>
            <article className="feature">
              <h3>🔥 Trending Hashtags</h3>
              <p>Automatically includes relevant trending hashtags to boost your post's discoverability and reach.</p>
            </article>
            <article className="feature">
              <h3>🎨 Visual Content Suggestions</h3>
              <p>Get recommendations for images, videos, and graphics that complement your written content.</p>
            </article>
            <article className="feature">
              <h3>⏰ Content Calendar Planning</h3>
              <p>Generate posts in advance and plan your entire social media calendar weeks or months ahead.</p>
            </article>
            <article className="feature">
              <h3>🎭 Multiple Tone Options</h3>
              <p>Choose from professional, casual, humorous, inspirational, or any custom tone that fits your brand.</p>
            </article>
            <article className="feature">
              <h3>🔄 Endless Variations</h3>
              <p>Generate multiple versions of the same post concept for A/B testing and content variety.</p>
            </article>
            <article className="feature">
              <h3>📊 Performance Insights</h3>
              <p>Track which types of AI-generated posts perform best and optimize your content strategy.</p>
            </article>
            <article className="feature">
              <h3>🚀 Call-to-Action Integration</h3>
              <p>Built-in CTAs that drive website traffic, sales, newsletter signups, and other business goals.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="content-types" style={{ background: '#  1e1e1e', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Generate Any Type of Social Media Content</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(250px, 1fr))', gap: '2rem' }}>
            <div className="content-type" style={{    padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
              <h4 style={{ color: '#ff6600' }}>Inspirational Quotes</h4>
              <p>Motivational and inspiring content that resonates</p>
            </div>
            <div className="content-type" style={{    padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎉</div>
              <h4 style={{ color: '#ff6600' }}>Promotional Posts</h4>
              <p>Sales-focused content that drives conversions</p>
            </div>
            <div className="content-type" style={{    padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
              <h4 style={{ color: '#ff6600' }}>Educational Content</h4>
              <p>Tips, tutorials, and valuable insights</p>
            </div>
            <div className="content-type" style={{    padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤔</div>
              <h4 style={{ color: '#ff6600' }}>Question Posts</h4>
              <p>Engaging questions that spark conversations</p>
            </div>
            <div className="content-type" style={{    padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📰</div>
              <h4 style={{ color: '#ff6600' }}>News & Updates</h4>
              <p>Company news and industry updates</p>
            </div>
            <div className="content-type" style={{    padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
              <h4 style={{ color: '#ff6600' }}>User-Generated Content</h4>
              <p>Posts that showcase customer stories</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Social Media Managers Love Our Tool</h2>
          <div className="grid">
            <article className="card" style={{    padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p2.jpeg" alt="Emma - Social Media Manager" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Emma Wilson</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Social Media Manager, FashionCo</p>
                </div>
              </div>
              <blockquote>"Our engagement rates increased by 250% after using this tool. It's like having a team of copywriters working 24/7!"</blockquote>
            </article>
            <article className="card" style={{    padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p1.jpg" alt="Carlos - Digital Marketer" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Carlos Martinez</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Digital Marketer, StartupX</p>
                </div>
              </div>
              <blockquote>"I create a month's worth of social media content in just 2 hours. The quality is incredible and perfectly matches our brand voice."</blockquote>
            </article>
            <article className="card" style={{    padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <Image src="/assets/p3.jpeg" alt="Lisa - Small Business Owner" className="testimonial-avatar" width={60} height={60} style={{ borderRadius: '50%', marginRight: '1rem' }} />
                <div>
                  <h4 style={{margin:0}}>Lisa Chen</h4>
                  <p style={{ opacity: 0.7, margin: 0 }}>Small Business Owner</p>
                </div>
              </div>
              <blockquote>"As a solo entrepreneur, this tool is a lifesaver. My social media presence has never been stronger, and I save 10+ hours per week."</blockquote>
            </article>
          </div>
        </div>
      </section>

      <section className="stats-section" style={{ background: 'linear-gradient(135deg, #ff6600, #ff8533)', color: 'white', padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '3rem', color: 'white' }}>Trusted by Growing Brands</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>50,000+</h3>
              <p style={{ fontSize: '1.1rem' }}>Posts Generated Daily</p>
            </div>
            <div>
              <h3 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>15,000+</h3>
              <p style={{ fontSize: '1.1rem' }}>Active Users</p>
            </div>
            <div>
              <h3 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>250%</h3>
              <p style={{ fontSize: '1.1rem' }}>Average Engagement Increase</p>
            </div>
            <div>
              <h3 style={{ fontSize: '3rem', margin: 0, color: 'white' }}>10</h3>
              <p style={{ fontSize: '1.1rem' }}>Hours Saved Per Week</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Create Viral Social Media Posts?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Join thousands of brands creating scroll-stopping content with AI.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Start Creating Posts Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Go to Post Generator
              </button>
            </Link>
          </SignedIn>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
            ✅ No credit card required • ✅ 20 free posts • ✅ Cancel anytime
          </p>
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