"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../../tools/tools.css';

export default function HowAIStorytellingEvolved() {
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
            How AI Storytelling
            <span style={{ color: '#ff6600' }}> Evolved</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem', textAlign: 'center' }}>
            From Mad Libs to emotional intelligence: the complete evolution of AI storytelling tools
            and what it means for creators in 2025.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>The Five Generations of AI Storytelling</h2>

          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>1️⃣</div>
                <h3 style={{ color: '#ff6600', margin: 0 }}>Generation 1: Template Filling (2015-2018)</h3>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>The Era:</strong> Mad Libs for marketing content
              </p>
              <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                Early AI writing tools were essentially sophisticated template systems. You'd fill in blanks:
                [Company Name] helps [Target Audience] achieve [Benefit] through [Product].
              </p>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#888' }}>What it could do:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Generate product descriptions</li>
                  <li>Create basic ad copy variations</li>
                  <li>Fill in email templates</li>
                </ul>
              </div>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#888' }}>What it couldn't do:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Understand context or nuance</li>
                  <li>Create original narrative structure</li>
                  <li>Capture brand voice</li>
                  <li>Generate emotional resonance</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>2️⃣</div>
                <h3 style={{ color: '#ff6600', margin: 0 }}>Generation 2: Pattern Recognition (2018-2020)</h3>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>The Era:</strong> GPT-2 and early language models
              </p>
              <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                AI started recognizing patterns in existing content and could generate text that sounded more natural.
                But it was still fundamentally about predicting the next word based on statistical patterns.
              </p>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#888' }}>What improved:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>More natural-sounding prose</li>
                  <li>Better grammar and syntax</li>
                  <li>Ability to maintain topic coherence</li>
                  <li>Generate longer-form content</li>
                </ul>
              </div>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#888' }}>Still missing:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Emotional intelligence</li>
                  <li>Strategic narrative choices</li>
                  <li>Consistent voice across projects</li>
                  <li>Understanding of "why" behind story decisions</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>3️⃣</div>
                <h3 style={{ color: '#ff6600', margin: 0 }}>Generation 3: Context Awareness (2020-2022)</h3>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>The Era:</strong> GPT-3 and transformer models
              </p>
              <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                The breakthrough: AI that could maintain context over longer conversations and understand more
                complex instructions. This is when tools like Jasper, Copy.ai, and ChatGPT emerged.
              </p>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#888' }}>Major advances:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Understanding complex prompts</li>
                  <li>Maintaining narrative coherence</li>
                  <li>Following style guidelines</li>
                  <li>Generating creative variations</li>
                </ul>
              </div>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#888' }}>The gap:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Forgot everything between sessions</li>
                  <li>Generic output for every brand</li>
                  <li>No understanding of emotional impact</li>
                  <li>Reactive, not proactive</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>4️⃣</div>
                <h3 style={{ color: '#ff6600', margin: 0 }}>Generation 4: Personalization Era (2022-2024)</h3>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>The Era:</strong> Custom GPTs and fine-tuned models
              </p>
              <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                AI tools started offering ways to "remember" preferences and customize outputs. Custom instructions,
                saved prompts, and basic personalization features emerged.
              </p>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#888' }}>Progress made:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Custom instructions and preferences</li>
                  <li>Saved prompt templates</li>
                  <li>Basic tone matching</li>
                  <li>Multi-modal capabilities (text + images)</li>
                </ul>
              </div>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#888' }}>Still problematic:</strong>
                <ul style={{ marginTop: '0.5rem', color: '#aaa' }}>
                  <li>Personalization was surface-level</li>
                  <li>No true brand voice memory</li>
                  <li>Required constant re-prompting</li>
                  <li>Couldn't manage multiple projects/brands</li>
                </ul>
              </div>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '2px solid #ff6600', boxShadow: '0 0 20px rgba(255,102,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '2rem' }}>5️⃣</div>
                <h3 style={{ color: '#ff6600', margin: 0 }}>Generation 5: Emotion-First AI (2024-Present)</h3>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>The Era:</strong> Creator-focused collaboration tools
              </p>
              <p style={{ marginBottom: '1rem' }}>
                The current generation—where <Link href="/tools/ai-story-generator" style={{ color: '#ff6600', textDecoration: 'underline' }}>Sreve Creator</Link> lives—focuses
                on emotional intelligence, permanent brand memory, and true creative collaboration.
              </p>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong style={{ color: '#ff6600' }}>What defines this generation:</strong>
                <ul style={{ marginTop: '0.5rem' }}>
                  <li><strong>Emotion-first approach:</strong> Starts with what you want readers to feel</li>
                  <li><strong>Permanent memory:</strong> Never forgets your brand voice or preferences</li>
                  <li><strong>Multi-project intelligence:</strong> Seamlessly manages multiple brands</li>
                  <li><strong>Proactive collaboration:</strong> Suggests ideas, not just executes commands</li>
                  <li><strong>Learns from edits:</strong> Continuously improves understanding of your style</li>
                  <li><strong>Context continuity:</strong> Builds on every previous conversation</li>
                </ul>
              </div>
              <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #ff6600' }}>
                <strong style={{ color: '#ff6600' }}>The breakthrough:</strong>
                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  AI that understands the <em>why</em> behind storytelling decisions, not just the what.
                  It's the difference between a tool that helps you write and a partner that helps you create.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Key Turning Points in AI Storytelling</h2>
          <div style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>2017: The Template Breakthrough</h3>
              <p style={{ marginBottom: '0.5rem', color: '#aaa' }}>
                <strong>What happened:</strong> First tools that could generate variations of marketing copy at scale
              </p>
              <p>
                <strong>Impact:</strong> Proved AI could handle repetitive content tasks, but exposed limitations
                of template-based approaches. Everything sounded the same.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>2020: The GPT-3 Moment</h3>
              <p style={{ marginBottom: '0.5rem', color: '#aaa' }}>
                <strong>What happened:</strong> GPT-3 demonstrated unprecedented language understanding and generation
              </p>
              <p>
                <strong>Impact:</strong> Shifted industry from "AI can write words" to "AI can write coherently."
                But <Link href="/blog/the-problem-with-ai-story-generators-no-soul" style={{ color: '#ff6600', textDecoration: 'underline' }}>still lacked emotional depth</Link>.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>2022: The ChatGPT Disruption</h3>
              <p style={{ marginBottom: '0.5rem', color: '#aaa' }}>
                <strong>What happened:</strong> ChatGPT made advanced AI accessible to everyone
              </p>
              <p>
                <strong>Impact:</strong> Democratized AI writing but revealed the cost: generic tools that
                work for everyone work perfectly for no one. Creator-specific needs went unmet.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>2024: The Emotional Intelligence Shift</h3>
              <p style={{ marginBottom: '0.5rem', color: '#aaa' }}>
                <strong>What happened:</strong> First AI tools designed with emotion-first approaches
              </p>
              <p>
                <strong>Impact:</strong> Changed the question from "can AI write?" to "can AI understand what
                makes stories work?" This is where <Link href="/blog/how-we-built-story-generator-feels-human" style={{ color: '#ff6600', textDecoration: 'underline' }}>Sreve Creator emerged</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#030303' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Comparing the Generations</h2>
          <div className="comparison-table" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0f0f0f' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ff6600', background: '#000' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Capability</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>Gen 1-2</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>Gen 3-4</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#ff6600' }}>Gen 5</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Generate coherent text</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>⚠️ Basic</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Understand context</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>⚠️ Session-only</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅ Permanent</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Brand voice consistency</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>⚠️ With prompts</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅ Automatic</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Emotional intelligence</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Multi-project management</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Proactive suggestions</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem' }}>Learn from your edits</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>✅</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>Creator collaboration</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>❌</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>⚠️ Limited</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#ff6600' }}>✅ Full</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>What's Next: The Future of AI Storytelling</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🎭 Emotional Nuance</h3>
              <p>
                AI that doesn't just recognize "happy" vs "sad" but understands the difference between
                wistful nostalgia and melancholic longing.
              </p>
            </div>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🧠 Strategic Thinking</h3>
              <p>
                AI that helps with high-level narrative decisions, not just execution. "Should this
                story start with conflict or context?"
              </p>
            </div>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🔄 Continuous Learning</h3>
              <p>
                AI that gets better at capturing your voice with every edit, learning your preferences
                without being explicitly taught.
              </p>
            </div>
            <div style={{ padding: '2rem', borderRadius: '12px', background: '#1f1f1f' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🎯 Audience Intelligence</h3>
              <p>
                AI that understands not just your brand voice but also how different audiences respond
                to different emotional approaches.
              </p>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '2rem', color: '#aaa' }}>
            Learn more about <Link href="/blog/ai-can-write-stories-but-can-it-feel-them" style={{ color: '#ff6600', textDecoration: 'underline' }}>whether AI can feel stories</Link> and
            what that means for the future of creative tools.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#030303', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem' }}>Experience Generation 5 AI Storytelling</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Sreve Creator represents the cutting edge of emotion-first AI. Try the difference today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Try Sreve Creator Free
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
            <Link href="/tools/ai-story-generator">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'transparent', border: '2px solid #ff6600' }}>
                Learn About Story Generator
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ padding: '3rem 0', background: '#000' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>AI Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-story-generator">AI Story Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-chat">AI Chat</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-content-generator">Content Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools">All Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#ff6600', marginBottom: '1rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog">Blog</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/the-problem-with-ai-story-generators-no-soul">AI Story Problems</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog/how-we-built-story-generator-feels-human">How We Built This</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/learn/how-ai-storytelling-evolved">AI Evolution</Link></li>
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
            "@type": "Article",
            "headline": "How AI Storytelling Evolved",
            "description": "From Mad Libs to emotional intelligence: the complete evolution of AI storytelling tools and what it means for creators in 2025.",
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
            "datePublished": "2025-10-31",
            "mainEntityOfPage": "https://sreve.online/learn/how-ai-storytelling-evolved"
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
                "name": "Learn",
                "item": "https://sreve.online/learn"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "How AI Storytelling Evolved",
                "item": "https://sreve.online/learn/how-ai-storytelling-evolved"
              }
            ]
          })
        }}
      />
    </>
  );
}
