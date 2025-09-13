"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function AISentenceRewriterPage() {
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
            AI Sentence Rewriter Tool - 
            <span style={{ color: '#ff6600' }}> Rewrite Any Sentence Instantly</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Transform your sentences with our advanced AI sentence rewriter. Whether you need to improve clarity, 
            change tone, or avoid repetition, our tool rewrites sentences while preserving meaning and enhancing readability.
          </p>
          
          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>✨ Instant Results</h4>
              <p>Rewrite sentences in seconds</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎯 Preserve Meaning</h4>
              <p>Maintain original context and intent</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📝 Multiple Styles</h4>
              <p>Formal, casual, professional tones</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="Enter a sentence you want to rewrite..."></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Rewrite for clarity</button>
                  <button className="chip">Make it more professional</button>
                  <button className="chip">Simplify this sentence</button>
                  <button className="chip">Change to active voice</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Rewrite My Sentence</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Rewriting</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Why Choose Our AI Sentence Rewriter?
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🚀 Advanced AI Technology</h3>
              <p>Powered by cutting-edge AI that understands context, grammar, and style nuances to deliver perfect sentence rewrites every time.</p>
            </article>
            <article className="feature">
              <h3>⚡ Lightning Fast</h3>
              <p>Get rewritten sentences in seconds. No waiting, no delays - just instant, high-quality sentence improvements.</p>
            </article>
            <article className="feature">
              <h3>🎨 Multiple Rewrite Options</h3>
              <p>Choose from various rewriting styles: formal, casual, academic, creative, and more to match your specific needs.</p>
            </article>
            <article className="feature">
              <h3>📊 Plagiarism-Free</h3>
              <p>Every rewritten sentence is unique and original, helping you avoid plagiarism while improving your content.</p>
            </article>
            <article className="feature">
              <h3>🔍 Context Preservation</h3>
              <p>Our AI maintains the original meaning while improving sentence structure, clarity, and readability.</p>
            </article>
            <article className="feature">
              <h3>💡 Smart Suggestions</h3>
              <p>Get intelligent suggestions for improving sentence flow, word choice, and overall impact.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="use-cases-section" style={{ background: '# 1e1e1e', padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect For Every Writing Need</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="use-case-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>📚 Students & Academics</h4>
              <p>Improve essay quality, avoid repetitive language, and enhance academic writing clarity.</p>
            </div>
            <div className="use-case-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>✍️ Content Writers</h4>
              <p>Create engaging content variations, improve readability, and maintain consistent quality.</p>
            </div>
            <div className="use-case-card" style={{   padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>💼 Business Professionals</h4>
              <p>Polish emails, reports, and presentations with professional, clear sentence structure.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Ready to Transform Your Sentences?</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.8 }}>
            Join thousands of users who trust our AI sentence rewriter for better writing.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Start Rewriting for Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Go to Sentence Rewriter
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
            "name": "AI Sentence Rewriter - Sreve",
            "description": "Transform your sentences with advanced AI. Improve clarity, change tone, and enhance readability for better conversions instantly.",
            "url": "https://sreve.online/tools/ai-sentence-rewriter",
            "applicationCategory": "Writing Software",
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
              "description": "Free AI sentence rewriting with unlimited usage"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "850",
              "bestRating": "5"
            },
            "featureList": [
              "AI-powered sentence rewriting",
              "Multiple tone options", 
              "Clarity improvement",
              "Grammar correction",
              "Style enhancement",
              "Instant results"
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
                "name": "What does the AI Sentence Rewriter do?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The AI Sentence Rewriter transforms your sentences to improve clarity, change tone, fix grammar, and enhance readability while preserving the original meaning."
                }
              },
              {
                "@type": "Question",
                "name": "Is the AI Sentence Rewriter free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the AI Sentence Rewriter is completely free to use with unlimited sentence rewrites. No credit card required."
                }
              },
              {
                "@type": "Question",
                "name": "Can I choose different writing tones?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can select from multiple tones including professional, casual, formal, friendly, and more to match your specific needs."
                }
              },
              {
                "@type": "Question",
                "name": "How accurate is the AI rewriting?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our AI sentence rewriter uses advanced language models to ensure high accuracy while preserving meaning and improving readability. It's trusted by thousands of users daily."
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
                "name": "AI Sentence Rewriter",
                "item": "https://sreve.online/tools/ai-sentence-rewriter"
              }
            ]
          })
        }}
      />
    </>
  );
}