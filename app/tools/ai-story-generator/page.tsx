"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function AIStoryGeneratorPage() {
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
          <Link href="/learn">Learn</Link>
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

      <section className="hero" style={{ minHeight: '70vh', paddingTop: '120px' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            AI Story Generator That
            <span style={{ color: '#ff6600' }}> Actually Feels Human</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Stop settling for soulless AI stories. Sreve's story generator creates narratives with genuine emotional impact,
            capturing your brand voice and making readers actually care. Not templates—real storytelling.
            Learn about <Link href="/blog/the-problem-with-ai-story-generators-no-soul" style={{ color: '#ff6600', textDecoration: 'underline' }}>why most AI story generators fail</Link> and
            discover <Link href="/blog/how-we-built-story-generator-feels-human" style={{ color: '#ff6600', textDecoration: 'underline' }}> how we built one that works</Link>.
          </p>

          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>💫 Emotion-First</h4>
              <p>Stories built on feeling, not formulas</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎭 Voice Capture</h4>
              <p>Sounds like you, not generic AI</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🔥 Real Impact</h4>
              <p>Stories that connect and convert</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="Describe the story you want to create and what readers should feel..."></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Brand origin story</button>
                  <button className="chip">Customer success story</button>
                  <button className="chip">Product launch narrative</button>
                  <button className="chip">Founder journey</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate Your Story</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Start Creating Stories</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="platforms-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Template AI vs. Emotional AI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h4 style={{ color: '#888', marginBottom: '1rem' }}>Generic Story Generators</h4>
              <p style={{ color: '#666' }}>Template-driven • No emotional depth • Generic voice • Obvious AI writing</p>
            </div>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #ff6600' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Sreve Story Generator</h4>
              <p>Emotion-first approach • Authentic voice • Genuine connection • Feels human-written</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/blog/ai-can-write-stories-but-can-it-feel-them" style={{ color: '#ff6600', textDecoration: 'underline', fontSize: '1.1rem' }}>
              Read: Can AI Feel Stories? →
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Why Your Stories Will Actually Connect
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🎯 Emotion-First Generation</h3>
              <p>We start by understanding what you want readers to feel, then craft stories to deliver that emotional experience. Not structure-first—feeling-first.</p>
            </article>
            <article className="feature">
              <h3>🗣️ Voice Authenticity Engine</h3>
              <p>Your brand has a unique voice. Our AI learns your storytelling patterns, word choices, and emotional tone—then maintains them perfectly across all content.</p>
            </article>
            <article className="feature">
              <h3>💎 Specific, Not Generic</h3>
              <p>Great stories live in the details. Our AI generates unexpected, specific details that make stories feel observed and authentic—not template-generated.</p>
            </article>
            <article className="feature">
              <h3>🌊 Emotional Rhythm</h3>
              <p>Stories need to breathe. We create natural emotional flow—tension and release, depth and lightness—that keeps readers engaged throughout.</p>
            </article>
            <article className="feature">
              <h3>🎭 Show, Don't Tell</h3>
              <p>Instead of stating emotions, our AI shows them through actions, sensory details, and behavioral specifics that create genuine emotional impact.</p>
            </article>
            <article className="feature">
              <h3>🤝 Collaborative Creation</h3>
              <p>We don't replace your creativity—we amplify it. You bring emotional intention, we help express it with precision and impact.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="comparison-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Sreve vs Other AI Story Generators</h2>
          <div className="comparison-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff6600' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>Other Tools</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff6600' }}>Sreve Story Generator</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Emotional Intelligence</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Voice Consistency</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Specific Details</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Show vs Tell Approach</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Emotional Rhythm</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Collaborative Process</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>Feels Human-Written</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="use-cases-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect For Every Type of Story</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Brand Stories</h3>
              <p>Origin stories, mission narratives, and "why we exist" content that creates emotional connection with your audience.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Customer Success</h3>
              <p>Transform testimonials and case studies into compelling narratives that show real impact and emotional transformation.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Product Launches</h3>
              <p>Launch narratives that capture the problem, journey, and breakthrough—making your product the hero of a real story.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Founder Journeys</h3>
              <p>Personal stories that build trust by showing vulnerability, struggle, and the human side of building something meaningful.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Content Marketing</h3>
              <p>Blog posts, articles, and long-form content with narrative hooks that keep readers engaged from first word to CTA.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Social Storytelling</h3>
              <p>Short-form stories for social media that capture attention and create emotional moments in limited space.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-teaser" style={{ padding: '4rem 0', background: '#030303', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Create Stories That Actually Work</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Stop wasting time editing soulless AI content. Create stories with genuine emotional impact from the first draft.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Try Story Generator Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Start Creating Stories
                </button>
              </Link>
            </SignedIn>
            <Link href="/#pricing">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'transparent', border: '2px solid #ff6600' }}>
                See Pricing
              </button>
            </Link>
          </div>
          <p style={{ marginTop: '1.5rem', color: '#888' }}>
            No credit card required • Full access to all features • Stories that feel human
          </p>
        </div>
      </section>

      <section className="how-it-works" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>1️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Define Emotional Goal</h3>
              <p>Tell us what you want readers to feel—not just what the story should be about.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>2️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Share Brand Voice</h3>
              <p>Provide context about your brand, or let our AI learn from your existing content.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>3️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Collaborate & Refine</h3>
              <p>Work with AI to shape the story, add specific details, and capture the right emotional tone.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>4️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Get Human-Quality Stories</h3>
              <p>Receive stories that connect emotionally, maintain your voice, and actually engage readers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>How is this different from other AI story generators?</h3>
            <p>Most AI story generators focus on structure and templates. We start with emotional intention—what you want readers to feel—and build stories to deliver that feeling. We train on creative process, not just final outputs, so we understand how to create genuine emotional impact.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Will the stories sound like my brand?</h3>
            <p>Yes. Our AI learns your specific voice patterns, word choices, emotional tone, and storytelling style. It doesn't just match "professional" or "casual"—it captures the unique way your brand tells stories.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Can people tell it's AI-generated?</h3>
            <p>Our stories are collaborations between your vision and AI assistance. They feel human because they're built on emotional intention and authentic voice. The goal isn't to trick people—it's to create genuinely engaging stories efficiently.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Do I need to be a good writer to use this?</h3>
            <p>No. You need to understand what you want readers to feel and be able to provide brand context. The AI handles structure, language precision, and emotional flow. Many of our best users aren't professional writers—they're marketers, founders, and strategists with great creative vision.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>What types of stories can I create?</h3>
            <p>Brand origin stories, customer success stories, product launch narratives, founder journeys, blog content, social media stories, campaign narratives—any story where emotional connection matters. If it needs to make readers feel something, we can help you create it.</p>
          </div>

          <div>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>How long does it take to generate a story?</h3>
            <p>Initial generation takes 30-60 seconds. But the real magic happens in collaboration—you'll spend 5-10 minutes working with the AI to refine emotional tone, add specific details, and ensure it captures your vision perfectly. Much faster than writing from scratch or heavily editing generic AI output.</p>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ padding: '3rem 0', background: '#000' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>AI Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-chat">AI Chat</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-story-generator">AI Story Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-content-generator">Content Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools">All Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog">Blog</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/the-problem-with-ai-story-generators-no-soul">Why AI Stories Fail</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/how-we-built-story-generator-feels-human">How We Built This</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/learn/how-ai-storytelling-evolved">AI Storytelling Evolution</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/privacy-policy">Privacy Policy</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank">Contact</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/#pricing">Pricing</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/#features">Features</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', textAlign: 'center', color: '#888' }}>
            <p>© 2024 Sreve. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Sreve AI Story Generator",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "19",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "127"
            },
            "description": "AI story generator that creates emotionally resonant narratives with authentic brand voice. Built for creators who need stories that connect, not just fill space."
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
                "name": "How is this different from other AI story generators?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most AI story generators focus on structure and templates. We start with emotional intention—what you want readers to feel—and build stories to deliver that feeling. We train on creative process, not just final outputs, so we understand how to create genuine emotional impact."
                }
              },
              {
                "@type": "Question",
                "name": "Will the stories sound like my brand?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Our AI learns your specific voice patterns, word choices, emotional tone, and storytelling style. It doesn't just match professional or casual—it captures the unique way your brand tells stories."
                }
              },
              {
                "@type": "Question",
                "name": "Can people tell it's AI-generated?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our stories are collaborations between your vision and AI assistance. They feel human because they're built on emotional intention and authentic voice. The goal isn't to trick people—it's to create genuinely engaging stories efficiently."
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
                "name": "Tools",
                "item": "https://sreve.online/tools"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "AI Story Generator",
                "item": "https://sreve.online/tools/ai-story-generator"
              }
            ]
          })
        }}
      />
    </>
  );
}
