"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../../tools/tools.css';

export default function AIChatVsCreatorChat() {
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

      <section className="hero" style={{ minHeight: '50vh', paddingTop: '120px' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
            AI Chat vs. Creator Chat:
            <span style={{ color: '#ff6600' }}> The Complete Comparison</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem', textAlign: 'center' }}>
            Not all AI chat tools are created equal. Here's exactly what separates generic chatbots from
            creator-focused collaboration tools—and why it matters for your content strategy.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>The Fundamental Difference</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <h3 style={{ color: '#888', marginBottom: '1.5rem', textAlign: 'center' }}>Traditional AI Chat</h3>
              <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>🤖</div>
              <p style={{ marginBottom: '1rem', textAlign: 'center', color: '#aaa' }}>
                Built for everyone. Optimized for no one.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>❌ No brand voice memory</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>❌ Forgets context between sessions</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>❌ One-way command execution</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>❌ Generic, templated output</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>❌ No multi-project management</li>
                <li style={{ padding: '0.5rem 0' }}>❌ Reactive, not proactive</li>
              </ul>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '2px solid #ff6600', boxShadow: '0 0 20px rgba(255,102,0,0.3)' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1.5rem', textAlign: 'center' }}>Creator Chat (Sreve)</h3>
              <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>🚀</div>
              <p style={{ marginBottom: '1rem', textAlign: 'center', color: '#fff' }}>
                Built exclusively for creators. Optimized for your workflow.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>✅ Permanent brand voice memory</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>✅ Continuous context across sessions</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>✅ Two-way creative collaboration</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>✅ Your unique voice, every time</li>
                <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #222' }}>✅ Seamless multi-brand switching</li>
                <li style={{ padding: '0.5rem 0' }}>✅ Proactive idea generation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Detailed Feature Comparison</h2>
          <div className="comparison-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0f0f0f' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff6600', background: '#000' }}>
                  <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '1.1rem' }}>Feature</th>
                  <th style={{ padding: '1.5rem', textAlign: 'center', color: '#888', fontSize: '1.1rem' }}>ChatGPT</th>
                  <th style={{ padding: '1.5rem', textAlign: 'center', color: '#888', fontSize: '1.1rem' }}>Claude</th>
                  <th style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600', fontSize: '1.1rem' }}>Sreve Creator</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Brand Voice Memory</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Permanent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Context Between Sessions</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Always</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Multi-Project Management</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Unlimited</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Proactive Suggestions</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Built-in</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Creator-Specific Training</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Yes</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Campaign Context Tracking</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Automatic</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Learns from Your Edits</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Continuously</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Iterative Co-Creation</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>⚠️ Limited</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>⚠️ Limited</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600' }}>✅ Full Support</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>Monthly Cost</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>$20</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center' }}>$20</td>
                  <td style={{ padding: '1.5rem', textAlign: 'center', color: '#ff6600', fontWeight: 'bold' }}>$19</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Real-World Scenarios</h2>
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Scenario 1: Managing Multiple Client Brands</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>With Generic AI Chat:</h4>
                  <p style={{ color: '#aaa' }}>
                    You switch to Client B's project. AI has no idea about their brand voice. You spend 10 minutes
                    re-explaining tone, audience, and style guidelines. Every. Single. Time.
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>With Sreve Creator Chat:</h4>
                  <p>
                    You switch to Client B's project. AI instantly loads their brand voice, previous campaigns,
                    and tone preferences. You start creating immediately. Zero setup time.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Scenario 2: Campaign Continuity</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>With Generic AI Chat:</h4>
                  <p style={{ color: '#aaa' }}>
                    Day 1: You create campaign messaging. Day 3: AI forgot everything. You copy-paste previous
                    outputs to remind it. It still doesn't match the original tone.
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>With Sreve Creator Chat:</h4>
                  <p>
                    Day 1: You create campaign messaging. Day 3: AI remembers the entire campaign context.
                    New content perfectly matches established tone and messaging without prompting.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Scenario 3: Creative Brainstorming</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <h4 style={{ color: '#888', marginBottom: '0.5rem' }}>With Generic AI Chat:</h4>
                  <p style={{ color: '#aaa' }}>
                    You ask for campaign ideas. AI gives you generic suggestions that could work for any brand.
                    You spend an hour refining and adapting them to your voice.
                  </p>
                </div>
                <div>
                  <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>With Sreve Creator Chat:</h4>
                  <p>
                    You ask for campaign ideas. AI suggests concepts tailored to your brand personality,
                    past successful campaigns, and audience preferences. Ideas feel native from the start.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Who Should Use What?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <h3 style={{ color: '#888', marginBottom: '1rem' }}>Use Generic AI Chat If You:</h3>
              <ul style={{ color: '#aaa' }}>
                <li style={{ marginBottom: '0.5rem' }}>Need one-off answers or tasks</li>
                <li style={{ marginBottom: '0.5rem' }}>Don't care about brand voice consistency</li>
                <li style={{ marginBottom: '0.5rem' }}>Create content sporadically</li>
                <li style={{ marginBottom: '0.5rem' }}>Work on a single brand only</li>
                <li style={{ marginBottom: '0.5rem' }}>Don't mind re-explaining context</li>
              </ul>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '2px solid #ff6600' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Use Sreve Creator Chat If You:</h3>
              <ul>
                <li style={{ marginBottom: '0.5rem' }}>Create content regularly or professionally</li>
                <li style={{ marginBottom: '0.5rem' }}>Need consistent brand voice</li>
                <li style={{ marginBottom: '0.5rem' }}>Manage multiple brands or clients</li>
                <li style={{ marginBottom: '0.5rem' }}>Value your time (no re-explaining)</li>
                <li style={{ marginBottom: '0.5rem' }}>Want a true creative partner</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Related Resources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <Link href="/blog/ai-chat-is-dead-meet-creator-chat-revolution" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333', height: '100%' }}>
                <h3 style={{ color: '#ff6600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>AI Chat is Dead →</h3>
                <p style={{ color: '#aaa' }}>Why the creator chat revolution changes everything</p>
              </div>
            </Link>
            <Link href="/blog/why-your-ai-chatbot-sounds-boring" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333', height: '100%' }}>
                <h3 style={{ color: '#ff6600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Fix Boring AI →</h3>
                <p style={{ color: '#aaa' }}>Why your chatbot sounds robotic and how to fix it</p>
              </div>
            </Link>
            <Link href="/blog/creators-need-ai-collaboration-not-chat" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333', height: '100%' }}>
                <h3 style={{ color: '#ff6600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Need Collaboration →</h3>
                <p style={{ color: '#aaa' }}>The difference between chat and collaboration</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #ff6600, #ff8533)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>
            Experience the Difference Yourself
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#fff', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Stop fighting with generic AI. Start collaborating with AI built specifically for creators.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Try Sreve Creator Free
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/app">
              <button style={{ padding: '1rem 2.5rem', fontSize: '1.2rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Open Creator Chat
              </button>
            </Link>
          </SignedIn>
          <p style={{ marginTop: '1rem', color: '#fff' }}>14-day free trial • No credit card required</p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AI Chat vs Creator Chat: Complete Comparison",
            "description": "Detailed comparison between generic AI chat tools and creator-focused collaboration platforms. See why brand voice memory and context continuity matter.",
            "url": "https://sreve.online/learn/ai-chat-vs-creator-chat"
          })
        }}
      />
    </>
  );
}
