"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function BlogGeneratorPage() {
  const [blogTopic, setBlogTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [blogLength, setBlogLength] = useState('medium');
  const [tone, setTone] = useState('professional');

  const handleGenerate = () => {
    if (blogTopic.trim()) {
      const params = new URLSearchParams({
        topic: blogTopic,
        audience: targetAudience,
        length: blogLength,
        tone: tone
      });
      window.location.href = `/app?type=blog&${params.toString()}`;
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
            "name": "AI Blog Generator",
            "url": "https://sreve.online/tools/blog-generator",
            "description": "Free AI-powered blog generator that creates SEO-optimized, high-quality blog posts instantly",
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
            Free AI Blog Generator
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
            Create high-quality, SEO-optimized blog posts in seconds. Our AI blog generator helps you craft engaging content that ranks higher and saves you hours of writing time.
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
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Generate Your Blog Post Now</h2>
            
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter your blog topic (e.g., 'Benefits of AI in Marketing')"
                  value={blogTopic}
                  onChange={(e) => setBlogTopic(e.target.value)}
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
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
                >
                  <option value="">Target Audience</option>
                  <option value="business-owners">Business Owners</option>
                  <option value="marketers">Marketers</option>
                  <option value="entrepreneurs">Entrepreneurs</option>
                  <option value="general">General Public</option>
                </select>

                <select
                  value={blogLength}
                  onChange={(e) => setBlogLength(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
                >
                  <option value="short">Short (500-800 words)</option>
                  <option value="medium">Medium (800-1200 words)</option>
                  <option value="long">Long (1200-2000 words)</option>
                </select>

                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  style={{ padding: '0.75rem', borderRadius: '8px', border: 'none' }}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="expert">Expert</option>
                  <option value="friendly">Friendly</option>
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
                  Generate Blog Post
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
                    Sign In to Generate Blog Post
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
            Why Use Our AI Blog Generator?
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3>Lightning Fast</h3>
              <p>Generate complete blog posts in under 30 seconds. No more writer's block or hours of research.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
              <h3>SEO Optimized</h3>
              <p>Every blog post is crafted with SEO best practices, helping you rank higher in search results.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3>Audience Focused</h3>
              <p>Tailored content for your specific audience with the right tone and messaging that converts.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
              <h3>High Quality</h3>
              <p>AI-powered content that reads naturally and provides real value to your readers.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3>Cost Effective</h3>
              <p>Save thousands on content creation. One tool replaces expensive copywriters and agencies.</p>
            </div>

            <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
              <h3>Unlimited Revisions</h3>
              <p>Not happy with the first draft? Generate multiple versions until you find the perfect fit.</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem', backgroundColor: '#18191a', padding: '3rem', borderRadius: '16px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Blog Generator vs Traditional Writing</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div>
              <h3 style={{ color: '#ff6600', marginBottom: '1rem' }}>AI Blog Generator</h3>
              <ul style={{ listStyle: 'none', padding: 0, alignItems: 'left' }}>
                <li style={{ marginBottom: '0.5rem' }}>✅ 30 seconds creation time</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ SEO optimized automatically</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Consistent quality</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ $0-19/month cost</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Unlimited revisions</li>
                <li style={{ marginBottom: '0.5rem' }}>✅ Multiple tone options</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Traditional Writing</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>❌ 3-5 hours creation time</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Manual SEO research needed</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Quality varies by writer</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ $50-500+ per article</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Limited revision rounds</li>
                <li style={{ marginBottom: '0.5rem' }}>❌ Writer-dependent style</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>How Our Blog Generator Works</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#ff6600', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '2rem', 
                margin: '0 auto 1rem' 
              }}>1</div>
              <h3>Enter Your Topic</h3>
              <p>Simply type in your blog topic, target audience, and preferred style.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#ff6600', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '2rem', 
                margin: '0 auto 1rem' 
              }}>2</div>
              <h3>AI Processing</h3>
              <p>Our advanced AI analyzes your requirements and researches the topic thoroughly.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#ff6600', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white', 
                fontSize: '2rem', 
                margin: '0 auto 1rem' 
              }}>3</div>
              <h3>Get Your Blog Post</h3>
              <p>Receive a complete, SEO-optimized blog post ready to publish on your website.</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Is the AI blog generator really free?</h3>
              <p>Yes! You can generate up to 20 blog posts per month for free. Our Pro plan offers unlimited generation for just $19/month.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>How is this different from ChatGPT?</h3>
              <p>Our blog generator is specifically trained for creating SEO-optimized blog content with proper structure, headings, and marketing focus that converts readers into customers.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Can I customize the generated content?</h3>
              <p>Absolutely! All generated content can be edited, and you can regenerate sections or the entire blog post with different parameters.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>Will Google penalize AI-generated content?</h3>
              <p>No! Google doesn't penalize AI content as long as it's helpful, accurate, and provides value to readers. Our generator creates original, valuable content that ranks well.</p>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '1rem' }}>What blog topics work best?</h3>
              <p>Our AI works great with business, marketing, technology, health, lifestyle, and educational topics. The more specific your topic, the better the results.</p>
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
          <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Start Creating Amazing Blog Content Today</h2>
          <p style={{ marginBottom: '2rem', fontSize: '1.2rem', opacity: 0.9 }}>
            Join thousands of content creators who save hours every week with our AI blog generator.
          </p>
          
          <SignedIn>
            <Link href="/app?type=blog">
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
                Generate Your First Blog Post Free
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
                Get Started - It's Free!
              </button>
            </SignInButton>
          </SignedOut>
        </section>

        <nav style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Related Tools:</strong>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/tools/ai-content-generator" style={{ color: '#ff6600', textDecoration: 'underline' }}>
              AI Content Generator
            </Link>
            <Link href="/tools/social-media-post-generator" style={{ color: '#ff6600', textDecoration: 'underline' }}>
              Social Media Generator
            </Link>
            <Link href="/tools/blog-idea-generator" style={{ color: '#ff6600', textDecoration: 'underline' }}>
              Blog Idea Generator
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}