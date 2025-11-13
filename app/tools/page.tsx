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
      title: 'AI Story Generator',
      description: 'Create emotionally resonant stories with authentic brand voice. Not templates—real storytelling that connects with readers and drives engagement.',
      href: '/tools/ai-story-generator',
      icon: '✨'
    },
    {
      title: 'AI Chat for Creators',
      description: 'Collaborate with AI that remembers your brand voice, builds on ideas, and co-creates with you. Not just chat—true creative partnership.',
      href: '/tools/ai-chat',
      icon: '💬'
    },
    {
      title: 'AI Caption Generator',
      description: 'Create engaging captions for Instagram, TikTok, LinkedIn, and more. Used by 500+ agencies worldwide for social media marketing.',
      href: '/tools/ai-caption-generator',
      icon: '📱'
    },
    {
      title: 'AI Content Generator',
      description: 'Create high-quality articles, blog posts, and marketing content in minutes. Better than Jasper AI at 90% less cost.',
      href: '/tools/ai-content-generator',
      icon: '📄'
    },
    {
      title: 'Social Media Post Generator',
      description: 'Generate viral social media posts for all platforms. Drive engagement and grow your audience with AI-powered content.',
      href: '/tools/social-media-post-generator',
      icon: '🚀'
    },
    {
      title: 'AI Sentence Rewriter Tool',
      description: 'Transform your sentences with advanced AI. Improve clarity, change tone, and enhance readability for better conversions.',
      href: '/tools/ai-sentence-rewriter',
      icon: '✏️'
    },
    {
      title: 'Blog Idea Generator',
      description: 'Generate endless blog post ideas with SEO-optimized titles and trending topics for any niche or industry.',
      href: '/tools/blog-idea-generator',
      icon: '💡'
    },
    {
      title: 'Viral Post Generator',
      description: 'Create viral-worthy content that gets shared and drives massive engagement across social media platforms.',
      href: '/tools/viral-post-generator',
      icon: '🔥'
    },
    {
      title: 'AI Blog Generator',
      description: 'Generate complete blog posts with SEO optimization, compelling headlines, and engaging content that ranks and converts.',
      href: '/tools/blog-generator',
      icon: '📝'
    },
    {
      title: 'Content Calendar Generator',
      description: 'Plan 30, 60, or 90 days of content in 10 minutes. AI-powered calendar with strategic content mix and platform optimization.',
      href: '/tools/content-calendar-generator',
      icon: '📅'
    }
  ];

  return (
    <div className="tools-page">
      <header className="header">
        <Link href="/" aria-label="Sreve home">
          <Image src="/assets/logo.png" alt="Sreve Logo" className="logo" width={120} height={40} priority />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a href="/#features">Product</a>
          <Link href="/tools">Tools</Link>
          <a href="/#pricing">Pricing</a>
          <Link href="/resources">Resources</Link>
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

      <section className="hero" style={{ minHeight: '50vh', paddingTop: '120px', background: 'var(--gradient-dark)' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--text-primary)' }}>
            AI Tools for 
            <span style={{ color: 'var(--orange-primary)' }}> Content Creation</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem', color: 'var(--text-secondary)' }}>
            Transform your content strategy with our comprehensive suite of AI-powered marketing tools. 
            Built for <Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--orange-primary)', textDecoration: 'underline' }}>agencies</Link>, marketers, and content creators who demand professional results without the premium price tag.
            Each tool is designed to save you hours while delivering scroll-stopping content that converts.
            <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--orange-primary)', textDecoration: 'underline' }}> Save 90% vs Jasper AI</Link> with the same quality results.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>500+ Agencies</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Trust Our Tools</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>10x Faster</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Content Creation</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>90% Savings</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>vs Premium Tools</div>
            </div>
          </div>
          
          <div className="prompt-box frost-effect" style={{ background: 'var(--frost-background)', border: '1px solid var(--frost-border)' }}>
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What type of content do you want to create?" style={{ color: 'var(--text-primary)' }}></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip" style={{ background: 'var(--gradient-orange)', color: 'white' }}>Rewrite this sentence for clarity</button>
                  <button className="chip" style={{ background: 'var(--gradient-orange)', color: 'white' }}>Generate Instagram captions for my product</button>
                  <button className="chip" style={{ background: 'var(--gradient-orange)', color: 'white' }}>Give me blog ideas for marketing</button>
                  <button className="chip" style={{ background: 'var(--gradient-orange)', color: 'white' }}>Create social media posts</button>
                </div>
              </div>
              
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button" style={{ background: 'var(--gradient-orange)', color: 'white' }}>Try Our AI Tools</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button" style={{ background: 'var(--gradient-orange)', color: 'white' }}>Start Creating</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="tools-grid-section" style={{ padding: '4rem 0', background: 'var(--darkness-level-2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {tools.map((tool, index) => (
              <Link href={tool.href} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="tool-card glass-effect" style={{ 
                  background: 'var(--glass-background)', 
                  padding: '2rem', 
                  borderRadius: '12px', 
                  border: '1px solid var(--glass-border)',
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
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center', fontSize: '1.4rem' }}>
                    {tool.title}
                  </h3>
                  <p style={{ flex: 1, textAlign: 'center', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {tool.description}
                  </p>
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <span style={{ 
                      color: 'var(--orange-primary)', 
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

      <section className="why-choose-section" style={{ padding: '4rem 0', background: 'var(--gradient-orange)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: 'white' }}>
            Why Choose Sreve AI Tools Over Expensive Alternatives?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className="frost-effect" style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>🎯</div>
              <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Built for Performance Marketing</h3>
              <p style={{ textAlign: 'center', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
                Unlike generic AI tools, our suite is specifically designed for marketers who need copy that converts. 
                Every tool focuses on driving engagement, clicks, and sales.
              </p>
            </div>
            <div className="frost-effect" style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>💰</div>
              <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Fraction of the Cost</h3>
              <p style={{ textAlign: 'center', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
                Get the same quality as tools costing $50-125/month for free. Our Pro plan at $19/month 
                still saves you over $1,200 annually compared to competitors.
              </p>
            </div>
            <div className="frost-effect" style={{ background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>⚡</div>
              <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '1rem' }}>Zero Learning Curve</h3>
              <p style={{ textAlign: 'center', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
                No complex setups or training required. Just enter your brief and get professional-quality 
                content in seconds. Perfect for busy marketing teams.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              Join <Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--orange-primary)', textDecoration: 'underline' }}>500+ agencies</Link> who've already made the switch from expensive alternatives like Jasper, Copy.ai, and Writesonic.
              Read our <Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--orange-primary)', textDecoration: 'underline' }}>social media AI tools guide</Link> for more insights.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}>
                Detailed Jasper AI Comparison →
              </Link>
              <Link href="/blog/best-ai-tools-content-marketing-2025" style={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}>
                Content Marketing Guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="use-cases-section" style={{ padding: '4rem 0', background: 'var(--darkness-level-3)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
            Perfect for Every Content Marketing Need
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div className="glass-effect" style={{ padding: '2rem', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--glass-background)' }}>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>🏢 Marketing Agencies</h3>
              <ul style={{ lineHeight: '1.6', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li>Scale client campaigns with AI-generated ad copy</li>
                <li>Create social media content for multiple brands</li>
                <li>Generate blog content that ranks and converts</li>
                <li>Pitch winning creative concepts in minutes</li>
              </ul>
            </div>
            <div className="glass-effect" style={{ padding: '2rem', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--glass-background)' }}>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>📊 Performance Marketers</h3>
              <ul style={{ lineHeight: '1.6', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li>A/B test ad variations at lightning speed</li>
                <li>Create scroll-stopping hooks and captions</li>
                <li>Generate UGC scripts that feel authentic</li>
                <li>Scale winning campaigns across platforms</li>
              </ul>
            </div>
            <div className="glass-effect" style={{ padding: '2rem', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--glass-background)' }}>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>🛍️ E-commerce Brands</h3>
              <ul style={{ lineHeight: '1.6', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li>Write compelling product descriptions</li>
                <li>Create email campaigns that drive sales</li>
                <li>Generate social proof and testimonials</li>
                <li>Build brand voice across all channels</li>
              </ul>
            </div>
            <div className="glass-effect" style={{ padding: '2rem', border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--glass-background)' }}>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>👤 Content Creators</h3>
              <ul style={{ lineHeight: '1.6', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li>Never run out of content ideas again</li>
                <li>Repurpose content across platforms</li>
                <li>Create engaging captions and hooks</li>
                <li>Build consistent posting schedule</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="success-stories-section" style={{ padding: '4rem 0', background: 'var(--darkness-level-2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
            Real Results from Real Marketing Teams
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="glass-effect" style={{ background: 'var(--glass-background)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', borderLeft: '4px solid var(--orange-primary)' }}>
              <blockquote style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                "We replaced our $250/month Jasper subscription with Sreve and actually get BETTER results. 
                Our ad CTR improved 300% using their caption generator for our beauty clients."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff6600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', marginRight: '1rem' }}>
                  SK
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Sarah Kim</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Performance Marketing Director</div>
                </div>
              </div>
            </div>
            <div className="glass-effect" style={{ background: 'var(--glass-background)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', borderLeft: '4px solid var(--orange-primary)' }}>
              <blockquote style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                "The blog idea generator has been a game-changer for our content strategy. We've gone from 
                struggling to find topics to having a 3-month content calendar filled with winning ideas."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff6600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', marginRight: '1rem' }}>
                  MR
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Mike Rodriguez</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Content Marketing Manager</div>
                </div>
              </div>
            </div>
            <div className="glass-effect" style={{ background: 'var(--glass-background)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border)', borderLeft: '4px solid var(--orange-primary)' }}>
              <blockquote style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                "Our agency now handles 3x more clients with the same team size. These AI tools don't just 
                save time—they help us create better creative concepts that win more pitches."
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff6600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', marginRight: '1rem' }}>
                  LT
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Lisa Thompson</div>
                  <div style={{ color: 'var(--text-tertiary)' }}>Agency Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="comparison-section" style={{ padding: '4rem 0', background: 'var(--darkness-level-1)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
            How Our Tools Stack Against the Competition
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="frost-effect" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--frost-background)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--frost-border)' }}>
              <thead>
                <tr style={{ background: 'var(--gradient-orange)', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Sreve</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Jasper AI</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Copy.ai</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Writesonic</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--darkness-level-3)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Starting Price</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--orange-primary)', fontWeight: 'bold' }}>FREE</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>$49/month</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>$36/month</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>$16/month</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--darkness-level-3)', background: 'var(--darkness-level-2)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Performance Marketing Focus</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>⚠️ Limited</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--darkness-level-3)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Brand Voice Training</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>5 voices</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>1 voice</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>1 voice</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Limited</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--darkness-level-3)', background: 'var(--darkness-level-2)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Setup Complexity</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--orange-primary)', fontWeight: 'bold' }}>5 minutes</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>2+ hours</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>1 hour</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>30 minutes</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Output Quality for Ads</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--orange-primary)', fontWeight: 'bold' }}>Excellent</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Generic</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Good</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Average</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              See the detailed breakdown: <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--orange-primary)', textDecoration: 'underline', fontWeight: 'bold' }}>Complete AI Tools Comparison Guide</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="integration-section" style={{ padding: '4rem 0', background: 'var(--darkness-level-2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
            Seamlessly Fits Your Existing Workflow
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Copy & Paste Workflow</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Generate content and copy directly to your favorite platforms—no API setup required.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Mobile Responsive</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Create content on the go with our fully responsive tools that work on any device.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Team Collaboration</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Share brand voices and templates across your marketing team for consistent results.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Performance Tracking</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Monitor which AI-generated content performs best to refine your strategy.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--darkness-level-3)' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Ready to Supercharge Your Content Creation?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Try any of our AI tools for free and see the difference quality AI makes.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'var(--gradient-orange)', color: 'white' }}>
                Get Started Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'var(--gradient-orange)', color: 'white' }}>
                Go to App
              </button>
            </Link>
          </SignedIn>
        </div>
      </section>

      <footer className="footer" style={{ background: 'var(--darkness-level-1)', padding: '4rem 0 1rem' }}>
        <div className="footer-content">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
              
              {/* AI Tools Section */}
              <div>
                <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>AI Content Creation Tools</h4>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                  <li><Link href="/tools/ai-caption-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Caption Generator</Link></li>
                  <li><Link href="/tools/ai-content-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Content Generator</Link></li>
                  <li><Link href="/tools/blog-idea-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Blog Idea Generator</Link></li>
                  <li><Link href="/tools/social-media-post-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Social Media Post Generator</Link></li>
                  <li><Link href="/tools/ai-sentence-rewriter" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Sentence Rewriter</Link></li>
                  <li><Link href="/tools/viral-post-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Viral Post Generator</Link></li>
                  <li><Link href="/tools/blog-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>AI Blog Generator</Link></li>
                </ul>
              </div>

              {/* Marketing Resources */}
              <div>
                <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Marketing Resources</h4>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                  <li><Link href="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Marketing Blog</Link></li>
                  <li><Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Jasper AI Alternative</Link></li>
                  <li><Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Best AI Tools for Agencies</Link></li>
                  <li><Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Social Media AI Tools</Link></li>
                  <li><Link href="/blog/best-ai-tools-content-marketing-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Content Marketing AI</Link></li>
                  <li><a href="/#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Pricing & Plans</a></li>
                </ul>
              </div>

              {/* Use Cases */}
              <div>
                <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Solutions by Industry</h4>
                <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                  <li><a href="#marketing-agencies" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Marketing Agencies</a></li>
                  <li><a href="#performance-marketers" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Performance Marketers</a></li>
                  <li><a href="#ecommerce-brands" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>E-commerce Brands</a></li>
                  <li><a href="#content-creators" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Content Creators</a></li>
                  <li><a href="/#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Platform Features</a></li>
                  <li><Link href="/tools" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>All AI Tools</Link></li>
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

            {/* Popular Comparisons Section */}
            <div style={{ borderTop: '1px solid var(--darkness-level-3)', paddingTop: '2rem', marginTop: '2rem' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Popular AI Tool Comparisons</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem 2rem' }}>
                <Link href="/blog/cheaper-jasper-alternative-2025" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Sreve vs Jasper AI</Link>
                <Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Sreve vs Copy.ai</Link>
                <Link href="/blog/best-ai-tools-content-marketing-2025" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Sreve vs Writesonic</Link>
                <Link href="/tools/ai-caption-generator" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Best Caption Generator</Link>
                <Link href="/tools/ai-content-generator" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>AI Content vs Human Writing</Link>
                <Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontSize: '0.9rem' }}>Social Media AI Tools</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom" style={{ borderTop: '1px solid var(--darkness-level-3)', paddingTop: '2rem', marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>© 2024 Sreve. All rights reserved. Save 90% vs Jasper AI with professional AI marketing tools.</p>
        </div>
      </footer>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "AI Tools for Content Creation - Sreve",
            "description": "Complete suite of AI-powered marketing tools for agencies and content creators. Create viral content, ad copy, and social media posts.",
            "url": "https://sreve.online/tools",
            "mainEntity": {
              "@type": "ItemList",
              "name": "AI Marketing Tools",
              "description": "Professional AI tools for content marketing, social media, and advertising",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "AI Caption Generator",
                    "description": "Create engaging captions for Instagram, TikTok, LinkedIn, and more. Perfect for social media managers.",
                    "url": "https://sreve.online/tools/ai-caption-generator",
                    "applicationCategory": "Social Media Marketing Software",
                    "operatingSystem": "Web Browser",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD",
                      "availability": "https://schema.org/InStock"
                    },
                    "provider": {
                      "@type": "Organization",
                      "name": "Sreve"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "AI Content Generator",
                    "description": "Create high-quality articles, blog posts, and marketing content in minutes with our advanced AI.",
                    "url": "https://sreve.online/tools/ai-content-generator",
                    "applicationCategory": "Content Marketing Software",
                    "operatingSystem": "Web Browser",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD",
                      "availability": "https://schema.org/InStock"
                    },
                    "provider": {
                      "@type": "Organization",
                      "name": "Sreve"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "Blog Idea Generator",
                    "description": "Generate endless blog post ideas with SEO-optimized titles and trending topics for any niche.",
                    "url": "https://sreve.online/tools/blog-idea-generator",
                    "applicationCategory": "Content Planning Software",
                    "operatingSystem": "Web Browser",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD",
                      "availability": "https://schema.org/InStock"
                    },
                    "provider": {
                      "@type": "Organization",
                      "name": "Sreve"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "Social Media Post Generator",
                    "description": "Generate viral social media posts for all platforms. Drive engagement and grow your audience.",
                    "url": "https://sreve.online/tools/social-media-post-generator",
                    "applicationCategory": "Social Media Marketing Software",
                    "operatingSystem": "Web Browser",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD",
                      "availability": "https://schema.org/InStock"
                    },
                    "provider": {
                      "@type": "Organization",
                      "name": "Sreve"
                    }
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 5,
                  "item": {
                    "@type": "SoftwareApplication",
                    "name": "AI Sentence Rewriter Tool",
                    "description": "Transform your sentences with advanced AI. Improve clarity, change tone, and enhance readability instantly.",
                    "url": "https://sreve.online/tools/ai-sentence-rewriter",
                    "applicationCategory": "Writing Software",
                    "operatingSystem": "Web Browser",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD",
                      "availability": "https://schema.org/InStock"
                    },
                    "provider": {
                      "@type": "Organization",
                      "name": "Sreve"
                    }
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
                  "name": "AI Tools",
                  "item": "https://sreve.online/tools"
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
                "name": "What makes Sreve AI tools different from other AI writing tools?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sreve AI tools are built specifically for performance marketing, not generic content. They focus on creating copy that converts, drives engagement, and generates sales. Unlike tools like Jasper or Copy.ai, Sreve understands marketing psychology and creates content optimized for business results."
                }
              },
              {
                "@type": "Question",
                "name": "How much do Sreve AI tools cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sreve offers a free plan with 20 AI-generated ideas per month. The Pro plan is just $19/month for 200 ideas and 5 brand voices, making it 90% cheaper than competitors like Jasper AI ($49-125/month)."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use Sreve AI tools for my marketing agency?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Sreve is perfect for marketing agencies. The Pro plan includes 5 brand voices so you can manage multiple clients, and the tools are specifically designed for creating client-winning creative concepts and performance marketing copy."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need technical skills to use Sreve AI tools?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No technical skills required. Sreve AI tools are designed for marketers and content creators. Simply enter your brief and get professional-quality content in seconds. Setup takes less than 5 minutes."
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}