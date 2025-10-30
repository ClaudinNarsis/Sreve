"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function AIChatPage() {
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

      <section className="hero" style={{ minHeight: '70vh', paddingTop: '120px' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            AI Chat for Creators -
            <span style={{ color: '#ff6600' }}> Collaborate, Don't Just Chat</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Stop using AI that forgets who you are. Sreve's creator chat remembers your brand voice, builds on your ideas,
            and collaborates with you like a real creative partner. Unlike generic chatbots, we're built specifically for content creators.
            Read about <Link href="/blog/ai-chat-is-dead-meet-creator-chat-revolution" style={{ color: '#ff6600', textDecoration: 'underline' }}>the creator chat revolution</Link> or
            learn <Link href="/blog/why-your-ai-chatbot-sounds-boring" style={{ color: '#ff6600', textDecoration: 'underline' }}> why your AI sounds boring</Link>.
          </p>

          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🧠 Brand Memory</h4>
              <p>Remembers your voice forever</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>💡 Proactive Ideas</h4>
              <p>Suggests, doesn't just execute</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎯 Context Aware</h4>
              <p>Multi-project management</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="Ask anything or brainstorm ideas together..."></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">Brainstorm campaign ideas</button>
                  <button className="chip">Write in my brand voice</button>
                  <button className="chip">Suggest content angles</button>
                  <button className="chip">Create social strategy</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Start Collaborating</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Open Creator Chat</button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      <section className="platforms-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Chat vs. Collaboration: The Difference</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h4 style={{ color: '#888', marginBottom: '1rem' }}>Generic AI Chat</h4>
              <p style={{ color: '#666' }}>Forgets your voice • One-way commands • No context memory • Generic output</p>
            </div>
            <div className="platform-card" style={{ padding: '2rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #ff6600' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Sreve Creator Chat</h4>
              <p>Remembers everything • Proactive suggestions • Multi-project context • Your unique voice</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/learn/ai-chat-vs-creator-chat" style={{ color: '#ff6600', textDecoration: 'underline', fontSize: '1.1rem' }}>
              See detailed comparison →
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Features Built for Creators
          </h2>
          <div className="features-grid">
            <article className="feature">
              <h3>🎭 Permanent Brand Voice Memory</h3>
              <p>Unlike ChatGPT that forgets between sessions, Sreve remembers your tone, style, and preferences forever. Stop re-explaining yourself.</p>
            </article>
            <article className="feature">
              <h3>🔄 Multi-Project Context Switching</h3>
              <p>Managing multiple clients? Switch between brand voices seamlessly. Each project maintains its own context and personality.</p>
            </article>
            <article className="feature">
              <h3>💡 Proactive Creative Suggestions</h3>
              <p>Get AI that doesn't just wait for commands—it suggests ideas, angles, and strategies based on your goals and past success.</p>
            </article>
            <article className="feature">
              <h3>🧠 Contextual Conversation History</h3>
              <p>Pick up where you left off. Every conversation builds on previous ones, creating a continuous creative partnership.</p>
            </article>
            <article className="feature">
              <h3>🎯 Strategic Thinking Mode</h3>
              <p>Beyond execution—AI that helps you think through campaigns, positioning, and content strategy at a high level.</p>
            </article>
            <article className="feature">
              <h3>⚡ Real-Time Collaboration</h3>
              <p>Brainstorm in real-time with AI that responds intelligently, builds on your ideas, and helps refine concepts iteratively.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="comparison-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Creators Choose Sreve Over ChatGPT</h2>
          <div className="comparison-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff6600' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Feature</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>ChatGPT</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff6600' }}>Sreve Creator</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Brand Voice Memory</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Multi-Project Management</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Proactive Suggestions</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Context Between Sessions</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Creator-Specific Training</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '1rem' }}>Price</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>$20/mo</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#ff6600' }}>$19/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="use-cases-section" style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect For</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Content Creators</h3>
              <p>Create consistent content that sounds authentically you across all platforms.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Marketing Agencies</h3>
              <p>Manage multiple client voices without mixing up brand personalities.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Social Media Managers</h3>
              <p>Brainstorm campaigns and create engaging content faster without losing quality.</p>
            </div>
            <div className="use-case-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Brand Strategists</h3>
              <p>Collaborate on positioning, messaging, and campaigns with AI that thinks strategically.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials-section" style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>What Creators Say</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="testimonial-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
                "Finally, an AI that doesn't make me sound like everyone else. Sreve remembers my voice and actually helps me think through content strategy."
              </p>
              <p style={{ color: '#ff6600' }}>— Sarah K., Social Media Manager</p>
            </div>
            <div className="testimonial-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
                "I manage 5 clients. Switching between brand voices used to be chaos. Now Sreve handles it seamlessly."
              </p>
              <p style={{ color: '#ff6600' }}>— Marcus T., Agency Owner</p>
            </div>
            <div className="testimonial-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
                "ChatGPT is great for tasks. Sreve is great for creativity. Completely different experiences."
              </p>
              <p style={{ color: '#ff6600' }}>— Lisa M., Content Strategist</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section" style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #ff6600, #ff8533)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>
            Ready to Collaborate with AI That Actually Gets You?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#fff' }}>
            Join thousands of creators using Sreve to create faster without losing their voice.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Start Free Trial
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Open Creator Chat
                </button>
              </Link>
            </SignedIn>
            <Link href="/blog/creators-need-ai-collaboration-not-chat">
              <button style={{ padding: '1rem 2rem', fontSize: '1.1rem', background: 'transparent', color: '#fff', border: '2px solid #fff', borderRadius: '8px', cursor: 'pointer' }}>
                Learn More
              </button>
            </Link>
          </div>
          <p style={{ marginTop: '1rem', color: '#fff' }}>No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Sreve AI Chat for Creators",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "19",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "500"
            },
            "description": "AI chat tool built specifically for content creators. Remembers your brand voice, manages multiple projects, and collaborates proactively on content strategy."
          })
        }}
      />
    </>
  );
}
