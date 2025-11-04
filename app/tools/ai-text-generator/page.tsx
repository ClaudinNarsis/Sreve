"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function AITextGeneratorPage() {
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
            AI Text Generator That
            <span style={{ color: '#ff6600' }}> Actually Sounds Like You</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Tired of editing robotic AI content to fix the tone? Sreve's text generator learns your actual voice and writes content that sounds human from the first draft.
            No more Wikipedia-style writing. Discover <Link href="/blog/ai-text-generator-gets-your-tone-right" style={{ color: '#ff6600', textDecoration: 'underline' }}>how we get tone right</Link> and
            learn <Link href="/blog/make-ai-write-like-human-not-grammar-bot" style={{ color: '#ff6600', textDecoration: 'underline' }}>why we don't sound like grammar bots</Link>.
          </p>

          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎯 Your Actual Tone</h4>
              <p>Learns from your content, not dropdowns</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>💬 Human Voice</h4>
              <p>Conversational, not encyclopedic</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>⚡ Less Editing</h4>
              <p>Sounds right from the start</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="What do you need to write? Include tone, audience, and purpose..."></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Blog post intro</button>
                  <button className="chip">Email newsletter</button>
                  <button className="chip">Social media caption</button>
                  <button className="chip">Product description</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate Your Content</button>
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

      <section className="platforms-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Generic AI vs. Voice-Aware AI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h4 style={{ color: '#888', marginBottom: '1rem' }}>Most AI Text Generators</h4>
              <p style={{ color: '#666' }}>Generic tone • Robotic voice • Hours of editing • Sounds like Wikipedia</p>
            </div>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #ff6600' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Sreve Text Generator</h4>
              <p>Your actual voice • Natural tone • Minimal editing • Sounds human-written</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/blog/ai-text-generators-sound-like-wikipedia" style={{ color: '#ff6600', textDecoration: 'underline', fontSize: '1.1rem' }}>
              Read: Why Most AI Sounds Like Wikipedia →
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Why Your Content Will Sound Right
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🎤 Voice Learning Engine</h3>
              <p>Feed us examples of your writing. We analyze sentence structure, word choices, pacing, and tone patterns—creating a profile of how you actually write.</p>
            </article>
            <article className="feature">
              <h3>🧠 Context-Aware Generation</h3>
              <p>We don't just adjust formality. We understand directness, emotion, authority, personality, and cultural context—generating with your multi-dimensional tone from the start.</p>
            </article>
            <article className="feature">
              <h3>💡 Natural Language Controls</h3>
              <p>Skip the sliders. Tell us "make this more skeptical" or "sound less like I'm selling." We understand tone adjustments in plain language.</p>
            </article>
            <article className="feature">
              <h3>📝 Human Writing Patterns</h3>
              <p>We break grammar rules intentionally. Sentence fragments. Conversational flow. Direct address. The patterns that make writing sound human, not bot-generated.</p>
            </article>
            <article className="feature">
              <h3>🎯 Position-First Writing</h3>
              <p>No more neutral, encyclopedic content. We help you take clear positions and write with opinion—the way humans actually communicate ideas.</p>
            </article>
            <article className="feature">
              <h3>⚙️ Adaptive Consistency</h3>
              <p>Your core voice stays consistent while tone adapts to context. Blog posts, emails, and social content all sound like you—just optimized for their purpose.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="comparison-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Sreve vs Other AI Text Generators</h2>
          <div className="comparison-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff6600' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>Jasper / Copy.ai</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff6600' }}>Sreve Text Generator</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Learns Your Voice</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Natural Tone Matching</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Conversational Output</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Position-Driven Content</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Minimal Editing Required</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Avoids AI Tells</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>Sounds Human-Written</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/learn/best-ai-text-generators-2025" style={{ color: '#ff6600', textDecoration: 'underline', fontSize: '1.1rem' }}>
              See Full Comparison: Best AI Text Generators 2025 →
            </Link>
          </div>
        </div>
      </section>

      <section className="use-cases-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect For Every Type of Content</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Blog Posts & Articles</h3>
              <p>Long-form content with your authentic voice, clear positions, and natural flow that keeps readers engaged.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Email Newsletters</h3>
              <p>Personal, conversational emails that sound like you're talking to a friend—not broadcasting to a list.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Social Media Content</h3>
              <p>Captions and posts that match your brand personality across platforms while adapting to each format.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Product Descriptions</h3>
              <p>Compelling copy that sells with your brand voice—not generic marketing buzzwords.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Website Copy</h3>
              <p>Homepage, about pages, landing pages—all in consistent voice that represents your brand accurately.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Ad Copy & Scripts</h3>
              <p>Persuasive messaging that sounds natural and authentic, not like every other ad people scroll past.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-teaser" style={{ padding: '4rem 0', background: '#030303', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Stop Editing AI Content to Sound Like You</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Start with AI that already knows your voice. Save hours of editing and publish content that sounds right from the first draft.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Try Text Generator Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Start Creating Content
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
            No credit card required • Full access to all features • Content that sounds like you
          </p>
        </div>
      </section>

      <section className="how-it-works" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>1️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Share Your Writing</h3>
              <p>Provide 3-5 examples of your content. We analyze your actual voice patterns, not abstract descriptions.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>2️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Define Your Content</h3>
              <p>Tell us what you're writing, who it's for, and what position you want to take.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>3️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Generate & Refine</h3>
              <p>Get content in your voice. Make natural language adjustments if needed.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>4️⃣</div>
              <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Publish Confidently</h3>
              <p>Content that sounds like you wrote it—because it's based on how you actually write.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>How is this different from Jasper or Copy.ai?</h3>
            <p>Most AI text generators use tone dropdowns and generic templates. We learn from your actual writing—analyzing sentence structure, word choices, pacing, and voice patterns. Instead of adjusting formality levels, we capture how you really write and generate content that matches from the start.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>How many examples do you need to learn my voice?</h3>
            <p>3-5 substantial pieces of content (blog posts, newsletters, or long articles) give us enough pattern data for basic voice matching. For more nuanced capture, 10-15 examples work better. The content should represent the voice you want us to replicate.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Will the content need heavy editing?</h3>
            <p>Most users need only light refinement—adding specific examples or adjusting a phrase or two. Because we start with your actual voice patterns, the tone is right from the first draft. You're refining, not rewriting.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Can I use this for multiple brand voices?</h3>
            <p>Yes. Create different voice profiles for different brands, projects, or content types. Switch between them as needed while maintaining consistent voice within each profile.</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>What if my brand voice is very distinctive?</h3>
            <p>Perfect use case. Distinctive voices with clear patterns are easier for AI to learn and replicate than generic corporate voices. The more unique your voice, the better our system captures and maintains it.</p>
          </div>

          <div>
            <h3 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Does it avoid those obvious "AI tells"?</h3>
            <p>Yes. We actively avoid phrases like "in today's digital landscape," "leverage," "seeking to," and other corporate buzzwords that scream AI-generated. We're trained on engaging content, not encyclopedic writing.</p>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ padding: '3rem 0', background: '#000' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>AI Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-text-generator">AI Text Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-story-generator">Story Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-content-generator">Content Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools">All Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog">Blog</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/ai-text-generator-gets-your-tone-right">Getting Tone Right</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/ai-text-generators-sound-like-wikipedia">Why AI Sounds Robotic</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/make-ai-write-like-human-not-grammar-bot">Writing Like a Human</Link></li>
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
            "name": "Sreve AI Text Generator",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "19",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "134"
            },
            "description": "AI text generator that learns your actual voice and creates content that sounds human from the first draft. No more robotic, Wikipedia-style writing."
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
                "name": "How is this different from Jasper or Copy.ai?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most AI text generators use tone dropdowns and generic templates. We learn from your actual writing—analyzing sentence structure, word choices, pacing, and voice patterns. Instead of adjusting formality levels, we capture how you really write and generate content that matches from the start."
                }
              },
              {
                "@type": "Question",
                "name": "How many examples do you need to learn my voice?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "3-5 substantial pieces of content (blog posts, newsletters, or long articles) give us enough pattern data for basic voice matching. For more nuanced capture, 10-15 examples work better. The content should represent the voice you want us to replicate."
                }
              },
              {
                "@type": "Question",
                "name": "Will the content need heavy editing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most users need only light refinement—adding specific examples or adjusting a phrase or two. Because we start with your actual voice patterns, the tone is right from the first draft. You're refining, not rewriting."
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
                "name": "AI Text Generator",
                "item": "https://sreve.online/tools/ai-text-generator"
              }
            ]
          })
        }}
      />
    </>
  );
}
