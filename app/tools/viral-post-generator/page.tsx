"use client";
import Link from 'next/link';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function ViralPostGeneratorPage() {
  const [postTopic, setPostTopic] = useState('');
  const [platform, setPlatform] = useState('linkedin');
  const [postStyle, setPostStyle] = useState('professional');
  const [callToAction, setCallToAction] = useState('engagement');

  const handleGenerate = () => {
    if (postTopic.trim()) {
      const params = new URLSearchParams({
        topic: postTopic,
        platform: platform,
        style: postStyle,
        cta: callToAction
      }); 
      window.location.href = `/app?type=viral-post&${params.toString()}`;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Viral Post Generator",
            "url": "https://sreve.online/tools/viral-post-generator",
            "description": "AI-powered viral post generator that creates engaging social media content for LinkedIn, Twitter, Facebook and more",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "Sreve",
              "url": "https://sreve.online"
            }
          })
        }}
      />
      
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>
            Free Viral Post Generator
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            Create viral-worthy social media posts that get maximum engagement. Our AI viral post generator crafts compelling content for LinkedIn, Twitter, Facebook, and more platforms.
          </p>
        </header>

        <section style={{ marginBottom: '4rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', 
            borderRadius: '16px', 
            padding: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Generate Your Viral Post Now</h2>
            
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter your post topic (e.g., 'Why most startups fail in their first year')"
                  value={postTopic}
                  onChange={(e) => setPostTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="general">Multi-Platform</option>
                </select>

                <select
                  value={postStyle}
                  onChange={(e) => setPostStyle(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="funny">Humorous</option>
                  <option value="controversial">Thought-provoking</option>
                  <option value="inspirational">Inspirational</option>
                </select>

                <select
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
                >
                  <option value="engagement">Engagement</option>
                  <option value="website">Drive Traffic</option>
                  <option value="newsletter">Newsletter Signup</option>
                  <option value="follow">Gain Followers</option>
                  <option value="sales">Generate Leads</option>
                </select>
              </div>

              <SignedIn>
                <button 
                  onClick={handleGenerate}
                  style={{
                    backgroundColor: 'white',
                    color: '#ff6600',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Generate Viral Post
                </button>
              </SignedIn>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button style={{
                    backgroundColor: 'white',
                    color: '#ff6600',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}>
                    Sign In to Generate Viral Post
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            What Makes Content Go Viral?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3>Emotional Hook</h3>
              <p>Content that triggers strong emotions (curiosity, surprise, anger, joy) gets shared more than neutral content.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
              <h3>Valuable Insights</h3>
              <p>Posts that teach something new, reveal secrets, or provide actionable tips get saved and shared.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔥</div>
              <h3>Controversial Takes</h3>
              <p>Thought-provoking opinions that challenge conventional wisdom spark discussions and engagement.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h3>Platform Optimization</h3>
              <p>Content tailored to each platform&apos;s unique audience and algorithms performs significantly better.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
              <h3>Storytelling</h3>
              <p>Personal stories and case studies create connection and relatability that drives sharing.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
              <h3>Perfect Timing</h3>
              <p>Posting when your audience is most active and riding trending topics increases visibility.</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem', backgroundColor: '#18191a', padding: '3rem', borderRadius: '16px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Viral Post Generator vs Manual Creation</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>AI Viral Post Generator</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>✅ 30 seconds to create</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Built-in viral formulas</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Platform-specific optimization</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Multiple variations</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Trending topic integration</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Consistent quality</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Manual Post Creation</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>❌ 30+ minutes per post</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Hit-or-miss engagement</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Platform knowledge needed</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Writer&apos;s block issues</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Manual trend research</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Inconsistent performance</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Platform-Specific Features</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ 
              padding: '2rem', 
              border: '2px solid #0077b5', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0077b5 0%, #004182 100%)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>📊 LinkedIn</h3>
              <ul style={{ marginBottom: 0 }}>
                <li>Professional tone optimization</li>
                <li>Industry-specific content</li>
                <li>Thought leadership hooks</li>
                <li>Business networking focus</li>
              </ul>
            </div>

            <div style={{ 
              padding: '2rem', 
              border: '2px solid #1da1f2', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1da1f2 0%, #0d47a1 100%)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>🐦 Twitter/X</h3>
              <ul style={{ marginBottom: 0 }}>
                <li>Character limit optimization</li>
                <li>Hashtag integration</li>
                <li>Thread creation</li>
                <li>Real-time trend usage</li>
              </ul>
            </div>

            <div style={{ 
              padding: '2rem', 
              border: '2px solid #1877f2', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1877f2 0%, #0d47a1 100%)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>📘 Facebook</h3>
              <ul style={{ marginBottom: 0 }}>
                <li>Community engagement focus</li>
                <li>Longer form content</li>
                <li>Group-friendly posts</li>
                <li>Family-safe content</li>
              </ul>
            </div>

            <div style={{ 
              padding: '2rem', 
              border: '2px solid #e4405f', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e4405f 0%, #833ab4 100%)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>📸 Instagram</h3>
              <ul style={{ marginBottom: 0 }}>
                <li>Visual-first descriptions</li>
                <li>Hashtag strategy</li>
                <li>Story-friendly format</li>
                <li>Influencer style content</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Success Stories & Results</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', backgroundColor: '#18191a', borderRadius: '12px', borderLeft: '4px solid #ff6600' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>&ldquo;10x Engagement Increase&rdquo;</strong>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                &ldquo;Using Sreve&apos;s viral post generator, my LinkedIn engagement went from 50 likes per post to 500+ likes consistently. The AI knows exactly what hooks work.&rdquo;
              </p>
              <small>- Sarah M., Marketing Manager</small>
            </div>

            <div style={{ padding: '2rem', backgroundColor: '#18191a', borderRadius: '12px', borderLeft: '4px solid #ff6600' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>&ldquo;50K+ Views in 24 Hours&rdquo;</strong>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                &ldquo;My first viral post generated with Sreve got 50,000+ views and 200+ comments. It brought me 500 new followers and 3 new clients.&rdquo;
              </p>
              <small>- Mike R., Business Coach</small>
            </div>

            <div style={{ padding: '2rem', backgroundColor: '#18191a', borderRadius: '12px', borderLeft: '4px solid #ff6600' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>&ldquo;Time Savings: 5 Hours Daily&rdquo;</strong>
              </div>
              <p style={{ marginBottom: '1rem' }}>
                &ldquo;I used to spend 5+ hours daily creating social content. Now I generate 10 high-quality posts in 15 minutes. Game changer for my agency.&rdquo;
              </p>
              <small>- Lisa K., Agency Owner</small>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>What makes a post go viral?</h3>
              <p>Viral posts typically have strong emotional hooks, provide valuable insights, challenge conventional thinking, or tell compelling stories. Our AI incorporates these proven viral formulas.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Can I use the same post across multiple platforms?</h3>
              <p>While the core message can be similar, each platform has unique audiences and algorithms. Our generator optimizes content specifically for each platform&apos;s best practices.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>How often should I post viral content?</h3>
              <p>Consistency is key. Aim for 1-2 high-quality posts per day rather than sporadic posting. Our generator helps you maintain a consistent content schedule effortlessly.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Will my content look authentic?</h3>
              <p>Absolutely! Our AI is trained to create authentic, human-like content that reflects your brand voice and personality. The content doesn&apos;t look or feel robotic.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>What if my post doesn&apos;t go viral?</h3>
              <p>While we optimize for viral potential, virality depends on many factors including timing, audience, and luck. Our generator significantly increases your chances of high engagement.</p>
            </div>
          </div>
        </section>

        <section style={{ 
          background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)', 
          borderRadius: '16px', 
          padding: '3rem 2rem', 
          color: 'white', 
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Start Creating Viral Content Today</h2>
          <p style={{ marginBottom: '2rem', fontSize: '1.2rem', opacity: 0.9 }}>
            Join thousands of creators who&apos;ve increased their social media engagement by 10x with our viral post generator.
          </p>
          
          <SignedIn>
            <Link href="/app?type=viral-post">
              <button style={{
                backgroundColor: 'white',
                color: '#ff6600',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Generate Your First Viral Post Free
              </button>
            </Link>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                backgroundColor: 'white',
                color: '#ff6600',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Get Started - It&apos;s Free!
              </button>
            </SignInButton>
          </SignedOut>
        </section>

        <section style={{ background: 'var(--darkness-level-2)', padding: '3rem 2rem', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>Master Viral Content Creation</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>🔥 Viral Content Guides</h3>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/blog/viral-post-generator-guide" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Complete Viral Post Generator Guide</Link></li>
                <li><Link href="/blog/create-viral-content-with-ai" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Psychology of Viral Content</Link></li>
                <li><Link href="/blog/linkedin-post-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ LinkedIn Viral Post Strategies</Link></li>
                <li><Link href="/blog/social-media-post-generator-tools-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Best Social Post Generator Tools</Link></li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>🛠️ Related AI Tools</h3>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/tools/ai-caption-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ AI Caption Generator</Link></li>
                <li><Link href="/tools/social-media-post-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Social Media Post Generator</Link></li>
                <li><Link href="/tools/blog-generator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Blog Generator</Link></li>
                <li><Link href="/tools" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ View All AI Tools</Link></li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'var(--orange-primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>📱 Social Media Marketing</h3>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                <li><Link href="/blog/ai-tools-social-media-marketing-2025" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Best Social Media AI Tools 2025</Link></li>
                <li><Link href="/blog/instagram-caption-ideas-for-business" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ Instagram Caption Ideas</Link></li>
                <li><Link href="/blog/social-media-content-calendar-with-ai" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ AI Content Calendar Guide</Link></li>
                <li><Link href="/blog" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>→ All Marketing Guides</Link></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}