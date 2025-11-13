"use client";
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import '../tools.css';

export default function ContentCalendarGeneratorPage() {
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
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <section className="hero" style={{ minHeight: '70vh', paddingTop: '120px' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            Content Calendar Generator -
            <span style={{ color: '#ff6600' }}> Plan 90 Days in 10 Minutes</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '800px' }}>
            Stop stressing about what to post tomorrow. Our AI-powered content calendar generator creates a complete
            30, 60, or 90-day posting schedule tailored to your brand, audience, and goals. Never face an empty calendar again.
          </p>

          <div className="features-highlight" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📅 90-Day Plans</h4>
              <p>Complete calendar in minutes</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>🎯 Strategic Mix</h4>
              <p>Balanced content pillars</p>
            </div>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>📊 Analytics-Driven</h4>
              <p>Based on what works</p>
            </div>
          </div>

          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder="Describe your brand and content goals... (e.g., 'Fitness coach helping busy professionals, want to grow Instagram')"></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">30-day Instagram calendar</button>
                  <button className="chip">90-day multi-platform plan</button>
                  <button className="chip">Content mix for agency</button>
                  <button className="chip">E-commerce posting schedule</button>
                </div>
              </div>
            </div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="generate-button">Generate My Calendar</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button className="generate-button">Create Content Calendar</button>
              </Link>
            </SignedIn>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.7 }}>
            <p style={{ fontSize: '0.9rem' }}>
              ✓ No credit card required • ✓ Used by 10,000+ creators • ✓ Export to CSV or Google Sheets
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#1e1e1e' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>What You Get in Your Content Calendar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            <div className="feature-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Complete Posting Schedule</h3>
              <p style={{ marginBottom: '1rem' }}>
                Every day planned with specific content ideas, captions, and optimal posting times for maximum engagement.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Daily content ideas</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Suggested captions</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Best posting times</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Hashtag recommendations</li>
              </ul>
            </div>

            <div className="feature-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎨</div>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Strategic Content Mix</h3>
              <p style={{ marginBottom: '1rem' }}>
                Balanced variety keeps your audience engaged while building authority across your content pillars.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ 40% Educational content</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ 30% Engagement posts</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ 20% Behind-the-scenes</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ 10% Promotional</li>
              </ul>
            </div>

            <div className="feature-card" style={{ padding: '2rem', borderRadius: '12px', background: '#0f0f0f', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>Multi-Platform Ready</h3>
              <p style={{ marginBottom: '1rem' }}>
                Platform-specific content optimized for Instagram, TikTok, LinkedIn, Twitter, and Facebook.
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Platform-specific formats</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Character limits respected</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Native features utilized</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Cross-posting strategies</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#000' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>See Your Calendar in Action</h2>

          <div style={{ maxWidth: '900px', margin: '0 auto', background: '#1e1e1e', borderRadius: '12px', padding: '2rem', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
            <h3 style={{ color: '#ff6600', marginBottom: '1.5rem', textAlign: 'center' }}>Sample 7-Day Content Calendar</h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { day: 'Monday', type: 'Educational', idea: 'How-to tutorial: "5 steps to [solve problem]"', time: '9:00 AM' },
                { day: 'Tuesday', type: 'Engagement', idea: 'Question post: "What\'s your biggest challenge with [topic]?"', time: '12:00 PM' },
                { day: 'Wednesday', type: 'Behind-the-Scenes', idea: 'Show your workspace or daily routine', time: '3:00 PM' },
                { day: 'Thursday', type: 'Story/Case Study', idea: 'Customer success story or transformation', time: '11:00 AM' },
                { day: 'Friday', type: 'Trending', idea: 'Jump on current trend with your unique angle', time: '1:00 PM' },
                { day: 'Saturday', type: 'Inspirational', idea: 'Weekend motivation or quick win tip', time: '10:00 AM' },
                { day: 'Sunday', type: 'Promotional', idea: 'Showcase product/service with social proof', time: '6:00 PM' }
              ].map((item, index) => (
                <div key={index} style={{ background: '#0f0f0f', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #ff6600' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: '#ff6600' }}>{item.day}</strong>
                      <span style={{ marginLeft: '0.5rem', opacity: 0.7, fontSize: '0.85rem' }}>({item.type})</span>
                    </div>
                    <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>⏰ {item.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{item.idea}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="cta-button">Generate My 30-Day Calendar</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/app">
                  <button className="cta-button">Start Creating My Calendar</button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#1e1e1e' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#ff6600', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>1</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Describe Your Brand</h4>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Tell us about your business, audience, and content goals</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#ff6600', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
              <h4 style={{ marginBottom: '0.5rem' }}>AI Creates Your Calendar</h4>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Our AI generates a strategic, balanced posting schedule</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#ff6600', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Export & Execute</h4>
              <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>Download as CSV, export to Google Sheets, or schedule directly</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#000' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Content Calendars Actually Work</h2>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>📈 Consistency = Growth</h3>
              <p>Accounts that post consistently grow 3x faster than sporadic posters. A calendar ensures you never miss a day.</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🧠 Eliminate Decision Fatigue</h3>
              <p>Stop staring at blank screens every morning. Know exactly what to post, when to post it, and why.</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>🎯 Strategic Content Mix</h3>
              <p>Balance educational, engagement, promotional, and entertainment content for maximum impact and audience retention.</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>⏰ Batch Creation</h3>
              <p>Create a week or month of content in one sitting. 10x more efficient than daily brainstorming.</p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>📊 Better Planning</h3>
              <p>Align content with product launches, holidays, trends, and business goals. Never scramble at the last minute.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#1e1e1e' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Perfect For</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ background: '#0f0f0f', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👔</div>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Marketing Agencies</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Manage multiple client calendars without the overhead</p>
            </div>

            <div style={{ background: '#0f0f0f', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💼</div>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Small Businesses</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Professional content planning without hiring a social media manager</p>
            </div>

            <div style={{ background: '#0f0f0f', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Content Creators</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Plan months ahead while staying spontaneous when inspiration hits</p>
            </div>

            <div style={{ background: '#0f0f0f', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛍️</div>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>E-commerce Brands</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Coordinate product launches, sales, and seasonal content effortlessly</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0', background: '#000' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Can I customize the generated calendar?</h4>
              <p style={{ opacity: 0.8 }}>Absolutely! The AI generates the foundation, but you can edit any idea, change posting times, swap content types, or regenerate specific days. Think of it as your creative assistant, not a replacement.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Does it work for multiple platforms?</h4>
              <p style={{ opacity: 0.8 }}>Yes! You can create platform-specific calendars (Instagram-only, LinkedIn-only) or multi-platform calendars that adapt content for each channel. The AI knows platform best practices and formats accordingly.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>How long does it take to generate a calendar?</h4>
              <p style={{ opacity: 0.8 }}>30 days: 2-3 minutes. 90 days: 5-7 minutes. Compare that to spending 2-3 hours manually planning your month. The ROI is immediate.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Can I export the calendar to my scheduling tool?</h4>
              <p style={{ opacity: 0.8 }}>Yes! Export as CSV (works with Excel/Google Sheets) or directly to popular scheduling tools. You can also copy-paste individual posts into native platform schedulers.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>What if I want to include trending content?</h4>
              <p style={{ opacity: 0.8 }}>The calendar leaves flexibility for spontaneous trending content. We recommend following the 70/30 rule: 70% planned evergreen content, 30% real-time trends and opportunities. The calendar handles the 70% so you can focus on the 30%.</p>
            </div>

            <div style={{ padding: '1.5rem', background: '#1e1e1e', borderRadius: '8px' }}>
              <h4 style={{ color: '#ff6600', marginBottom: '0.5rem' }}>Is this better than hiring a social media manager?</h4>
              <p style={{ opacity: 0.8 }}>For ideation and planning? Often yes. A social media manager costs $3,000-8,000/month. Sreve costs $19/month and generates unlimited calendars. Use us for planning, save your budget for strategy, engagement, and analytics.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '6rem 0', background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Stop Stressing About Tomorrow's Post</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
            Join 10,000+ creators, agencies, and brands who never worry about content again.
            Generate your complete content calendar in 10 minutes.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button style={{ background: 'white', color: '#ff6600', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                  Start Planning Free →
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/app">
                <button style={{ background: 'white', color: '#ff6600', padding: '1rem 2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                  Create Your Calendar →
                </button>
              </Link>
            </SignedIn>
          </div>

          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            ✓ No credit card required • ✓ 90-day calendar in 10 minutes • ✓ Export anywhere • ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Content Calendar Generator",
            "applicationCategory": "BusinessApplication",
            "offers": {
              "@type": "Offer",
              "price": "19.00",
              "priceCurrency": "USD"
            },
            "description": "AI-powered content calendar generator that creates complete 30, 60, or 90-day posting schedules for social media. Plan your content strategy in minutes.",
            "featureList": [
              "90-day content planning",
              "Multi-platform optimization",
              "Strategic content mix",
              "Export to CSV and scheduling tools",
              "AI-powered content ideas",
              "Customizable templates"
            ],
            "operatingSystem": "Web",
            "url": "https://sreve.online/tools/content-calendar-generator"
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
                "name": "Can I customize the generated calendar?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! The AI generates the foundation, but you can edit any idea, change posting times, swap content types, or regenerate specific days."
                }
              },
              {
                "@type": "Question",
                "name": "Does it work for multiple platforms?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! You can create platform-specific calendars or multi-platform calendars that adapt content for each channel. The AI knows platform best practices."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to generate a calendar?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "30 days: 2-3 minutes. 90 days: 5-7 minutes. Compare that to spending 2-3 hours manually planning your month."
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
