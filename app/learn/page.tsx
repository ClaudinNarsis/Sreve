"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools/tools.css';

export default function LearnPage() {
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

  const learnResources = [
    {
      title: 'How AI Storytelling Evolved',
      description: 'From Mad Libs to emotional intelligence: the complete evolution of AI storytelling tools and what it means for creators in 2025.',
      href: '/learn/how-ai-storytelling-evolved',
      icon: '📚',
      category: 'AI Evolution'
    },
    {
      title: 'AI Chat vs. Creator Chat',
      description: 'Not all AI chat tools are created equal. The complete comparison between generic chatbots and creator-focused collaboration tools.',
      href: '/learn/ai-chat-vs-creator-chat',
      icon: '🔄',
      category: 'Tool Comparison'
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
            Learn About
            <span style={{ color: 'var(--orange-primary)' }}> AI for Creators</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem', color: 'var(--text-secondary)' }}>
            Deep dives into AI tools, comparisons, evolution, and best practices. Understand how AI is changing creative work
            and how to use these tools effectively. Educational resources from the <Link href="/" style={{ color: 'var(--orange-primary)', textDecoration: 'underline' }}>Sreve team</Link>.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>In-Depth Guides</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Comprehensive Resources</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔬</div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Research-Backed</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Data-Driven Insights</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Actionable</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Practical Knowledge</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: 'var(--darkness-level-2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
            Learning Resources
          </h2>

          <div className="tools-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {learnResources.map((resource, index) => (
              <Link href={resource.href} key={index} style={{ textDecoration: 'none' }}>
                <div className="tool-card glass-effect" style={{
                  padding: '2rem',
                  borderRadius: '12px',
                  background: 'var(--glass-background)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'var(--glass-backdrop)',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{resource.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--orange-primary)', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                        {resource.category}
                      </div>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '0', color: 'var(--text-primary)' }}>
                        {resource.title}
                      </h3>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {resource.description}
                  </p>
                  <div style={{ color: 'var(--orange-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Read Guide →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-primary)' }}>
            Resource Categories
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', borderRadius: '12px', background: 'var(--darkness-level-2)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>AI Evolution</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Understand how AI tools have evolved from simple templates to emotion-first creative partners.
                Track the technological breakthroughs that matter for creators.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: 'var(--darkness-level-2)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Tool Comparisons</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Detailed breakdowns of different AI tools, their strengths, limitations, and ideal use cases.
                Make informed decisions about your creative toolkit.
              </p>
            </div>

            <div style={{ padding: '2rem', borderRadius: '12px', background: 'var(--darkness-level-2)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💡</div>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Best Practices</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Learn techniques, workflows, and strategies for using AI effectively in your creative process.
                From beginners to advanced users.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: 'var(--darkness-level-2)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
            Related Blog Content
          </h2>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2rem' }}>
            For more insights, case studies, and practical tips, check out our blog where we cover AI creativity,
            storytelling, and content marketing strategies.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <Link href="/blog/the-problem-with-ai-story-generators-no-soul" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--darkness-level-3)', border: '1px solid var(--glass-border)', height: '100%' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>The Problem with AI Story Generators</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Why most AI stories lack soul and what creators actually need</p>
              </div>
            </Link>

            <Link href="/blog/how-we-built-story-generator-feels-human" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--darkness-level-3)', border: '1px solid var(--glass-border)', height: '100%' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Building a Story Generator That Feels Human</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Behind-the-scenes: emotion-first AI development</p>
              </div>
            </Link>

            <Link href="/blog/ai-can-write-stories-but-can-it-feel-them" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--darkness-level-3)', border: '1px solid var(--glass-border)', height: '100%' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Can AI Feel Stories?</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Exploring the emotion gap in AI storytelling</p>
              </div>
            </Link>

            <Link href="/blog/ai-chat-is-dead-meet-creator-chat-revolution" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--darkness-level-3)', border: '1px solid var(--glass-border)', height: '100%' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>The Creator Chat Revolution</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Why traditional AI chat is broken for creators</p>
              </div>
            </Link>

            <Link href="/blog/why-your-ai-chatbot-sounds-boring" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--darkness-level-3)', border: '1px solid var(--glass-border)', height: '100%' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Why Your AI Chatbot Sounds Boring</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>How to fix robotic AI writing</p>
              </div>
            </Link>

            <Link href="/blog/creators-need-ai-collaboration-not-chat" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1.5rem', borderRadius: '8px', background: 'var(--darkness-level-3)', border: '1px solid var(--glass-border)', height: '100%' }}>
                <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Creators Need AI Collaboration</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Beyond one-way commands to true co-creation</p>
              </div>
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/blog">
              <button className="cta-button" style={{ background: 'var(--gradient-orange)', color: 'white', border: 'none' }}>
                View All Blog Posts
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: 'rgba(255, 102, 0, 0.1)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Ready to Try Sreve Creator?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem', color: 'var(--text-secondary)' }}>
            Put this knowledge into practice with AI tools built for creators who care about emotional impact.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'var(--gradient-orange)', color: 'white', border: 'none' }}>
                  Start Creating Free
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'var(--gradient-orange)', color: 'white', border: 'none' }}>
                  Go to App
                </button>
              </Link>
            </SignedIn>
            <Link href="/tools">
              <button className="cta-button" style={{ fontSize: '1.1rem', padding: '1rem 2rem', background: 'transparent', border: '2px solid var(--orange-primary)', color: 'var(--orange-primary)' }}>
                Explore Tools
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ padding: '3rem 0', background: 'var(--darkness-level-1)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>AI Tools</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-story-generator" style={{ color: 'var(--text-secondary)' }}>AI Story Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-chat" style={{ color: 'var(--text-secondary)' }}>AI Chat</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools/ai-caption-generator" style={{ color: 'var(--text-secondary)' }}>Caption Generator</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/tools" style={{ color: 'var(--text-secondary)' }}>All Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Learn</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/learn/how-ai-storytelling-evolved" style={{ color: 'var(--text-secondary)' }}>AI Storytelling Evolution</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/learn/ai-chat-vs-creator-chat" style={{ color: 'var(--text-secondary)' }}>AI Chat Comparison</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/blog" style={{ color: 'var(--text-secondary)' }}>Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--orange-primary)', marginBottom: '1rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><Link href="/privacy-policy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="https://api.whatsapp.com/send/?phone=9487731230&type=phone_number&app_absent=0" rel="noopener noreferrer" target="_blank" style={{ color: 'var(--text-secondary)' }}>Contact</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/#pricing" style={{ color: 'var(--text-secondary)' }}>Pricing</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/#features" style={{ color: 'var(--text-secondary)' }}>Features</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <p>© 2024 Sreve. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Learn About AI for Creators",
            "description": "Educational resources about AI tools, comparisons, evolution, and best practices for creative professionals.",
            "url": "https://sreve.online/learn",
            "publisher": {
              "@type": "Organization",
              "name": "Sreve",
              "logo": {
                "@type": "ImageObject",
                "url": "https://sreve.online/assets/logo.png"
              }
            },
            "about": {
              "@type": "Thing",
              "name": "AI for Creators",
              "description": "Artificial intelligence tools and techniques for creative professionals"
            }
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
              }
            ]
          })
        }}
      />
    </div>
  );
}
