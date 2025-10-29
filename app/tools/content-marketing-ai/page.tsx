"use client";
import Link from 'next/link';
import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import './content-marketing.css';

export default function ContentMarketingAIPage() {
  const [contentGoal, setContentGoal] = useState('');
  const [contentType, setContentType] = useState('blog-post');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('professional');

  const handleGenerate = () => {
    if (contentGoal.trim()) {
      const params = new URLSearchParams({
        goal: contentGoal,
        type: contentType,
        audience: targetAudience,
        tone: tone
      });
      window.location.href = `/app?${params.toString()}`;
    }
  };

  return (
    <div className="content-marketing-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Content Marketing AI Platform",
            "url": "https://sreve.online/tools/content-marketing-ai",
            "description": "All-in-one AI content marketing platform for agencies and marketers. Create blog posts, social content, ads, and more at 90% lower cost than Jasper AI.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "19",
              "priceCurrency": "USD",
              "priceValidUntil": "2025-12-31"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "2847",
              "bestRating": "5"
            },
            "featureList": [
              "AI Blog Post Generation",
              "Social Media Content Creation",
              "Performance Marketing Copy",
              "Multi-Brand Voice Management",
              "SEO Optimization",
              "Content Calendar Planning",
              "Campaign Performance Tracking"
            ],
            "creator": {
              "@type": "Organization",
              "name": "Sreve",
              "url": "https://sreve.online"
            }
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
                "name": "What is content marketing AI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Content marketing AI uses artificial intelligence to automate and enhance content creation, distribution, and optimization. Sreve's platform helps marketers create blog posts, social media content, ad copy, and more using advanced AI models trained specifically for performance marketing."
                }
              },
              {
                "@type": "Question",
                "name": "How is Sreve different from Jasper AI for content marketing?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sreve costs just $19/month compared to Jasper's $49-125/month, saving you 90% while providing the same quality output. We focus specifically on performance marketing content that converts, not generic writing. Plus, our agency-friendly features let you manage multiple brand voices in one platform."
                }
              },
              {
                "@type": "Question",
                "name": "Can AI replace my content marketing team?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "AI should enhance your team, not replace it. Sreve handles time-consuming tasks like first drafts, ideation, and variations, freeing your team to focus on strategy, editing, and high-level creative work. Most agencies see 70% faster content production while maintaining quality."
                }
              },
              {
                "@type": "Question",
                "name": "What types of content can I create with Sreve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sreve creates blog posts, social media content (LinkedIn, Twitter, Instagram), ad copy, email campaigns, video scripts, UGC scripts, product descriptions, landing page copy, and more. All content is optimized for your specific marketing goals and brand voice."
                }
              },
              {
                "@type": "Question",
                "name": "Is AI-generated content good for SEO?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Google doesn't penalize AI content as long as it's helpful, original, and provides value. Sreve's content marketing AI creates SEO-optimized content with proper keyword integration, natural language, and comprehensive coverage that ranks well in search engines."
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
                "name": "Content Marketing AI",
                "item": "https://sreve.online/tools/content-marketing-ai"
              }
            ]
          })
        }}
      />

      <div className="cm-container">
        <header className="cm-hero">
          <h1>Content Marketing AI That Actually Converts</h1>
          <p className="lead">
            The all-in-one AI platform for performance-driven content marketing. Create blogs, social posts, ads, and campaigns that drive real results — at 90% lower cost than Jasper AI.
          </p>
          <div className="trust-badges">
            <div className="badge">⭐ 4.8/5 Rating</div>
            <div className="badge">🚀 2,800+ Marketers</div>
            <div className="badge">💰 90% Cost Savings</div>
            <div className="badge">⚡ 10x Faster</div>
          </div>
        </header>

        <section className="cm-tool-section">
          <h2>Start Creating High-Converting Content Now</h2>

          <div className="tool-input-group">
            <textarea
              placeholder="What content marketing goal do you want to achieve? (e.g., 'Generate 10 blog post ideas about email marketing for SaaS companies')"
              value={contentGoal}
              onChange={(e) => setContentGoal(e.target.value)}
            />

            <div className="tool-options-grid">
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="blog-post">Blog Post</option>
                <option value="social-media">Social Media Post</option>
                <option value="ad-copy">Ad Copy</option>
                <option value="email-campaign">Email Campaign</option>
                <option value="video-script">Video Script</option>
                <option value="landing-page">Landing Page</option>
              </select>

              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="">Target Audience</option>
                <option value="b2b-saas">B2B SaaS</option>
                <option value="ecommerce">E-commerce</option>
                <option value="agencies">Marketing Agencies</option>
                <option value="small-business">Small Businesses</option>
                <option value="enterprise">Enterprise</option>
                <option value="consumers">Consumers</option>
              </select>

              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="expert">Expert/Thought Leader</option>
                <option value="conversational">Conversational</option>
                <option value="bold">Bold & Direct</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            <SignedIn>
              <button onClick={handleGenerate} className="tool-cta-button">
                Generate Content Marketing Material
              </button>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="tool-cta-button">
                  Sign In to Generate Content
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </section>

        <section className="cm-features">
          <h2>Why Marketers Choose Sreve for Content Marketing</h2>

          <div className="features-grid">
            <div className="feature-card">
              <span className="icon">🎯</span>
              <h3>Performance-Focused Content</h3>
              <p>
                Not just any content — we create marketing copy that drives clicks, conversions, and sales. Every piece is optimized for your specific KPIs.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">💰</span>
              <h3>90% Cheaper Than Jasper</h3>
              <p>
                Pay just $19/month instead of $49-125/month. Same quality AI, better marketing focus, massive savings. Perfect for agencies and growing businesses.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">🏢</span>
              <h3>Multi-Brand Management</h3>
              <p>
                Manage unlimited client brands with distinct voices, guidelines, and campaign histories. Built specifically for agencies and in-house teams.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">⚡</span>
              <h3>10x Faster Production</h3>
              <p>
                Create month's worth of content in hours. Blog posts in 30 seconds, social campaigns in 5 minutes, complete content calendars in 20 minutes.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">📈</span>
              <h3>SEO-Optimized by Default</h3>
              <p>
                Every piece of content follows SEO best practices — keyword integration, proper structure, meta descriptions, and semantic optimization for better rankings.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">🎨</span>
              <h3>Consistent Brand Voice</h3>
              <p>
                Train the AI on your brand guidelines, past content, and preferred style. Get perfectly on-brand content every time, across all channels.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">🔄</span>
              <h3>Multi-Channel Content</h3>
              <p>
                Create once, adapt everywhere. Generate blog posts, then automatically create social snippets, email versions, and ad variations from the same content.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">📊</span>
              <h3>Campaign Performance Tracking</h3>
              <p>
                See which AI-generated content performs best. Learn what works, refine your approach, and continuously improve your content marketing ROI.
              </p>
            </div>

            <div className="feature-card">
              <span className="icon">🛠️</span>
              <h3>20+ Specialized Tools</h3>
              <p>
                Blog generators, social post creators, ad copywriters, email campaigns, video scripts, UGC content, and more — all in one platform.
              </p>
            </div>
          </div>
        </section>

        <section className="cm-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">90%</span>
              <span className="stat-label">Cost Savings vs Jasper</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10x</span>
              <span className="stat-label">Faster Content Creation</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2,800+</span>
              <span className="stat-label">Active Marketers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Content Pieces Created</span>
            </div>
          </div>
        </section>

        <section className="cm-comparison">
          <h2>Content Marketing AI: Sreve vs Traditional Tools</h2>

          <div className="comparison-grid">
            <div className="comparison-column winner">
              <h3>Sreve Content Marketing AI</h3>
              <ul className="comparison-list">
                <li>✅ $19/month for unlimited content</li>
                <li>✅ Performance marketing focused</li>
                <li>✅ Multi-brand management built-in</li>
                <li>✅ 20+ specialized content tools</li>
                <li>✅ Campaign tracking & analytics</li>
                <li>✅ Agency-friendly workflows</li>
                <li>✅ SEO optimization automatic</li>
                <li>✅ Generate content in 30 seconds</li>
                <li>✅ Learn from your best content</li>
              </ul>
            </div>

            <div className="comparison-column">
              <h3>Jasper / Copy.ai / Writesonic</h3>
              <ul className="comparison-list">
                <li>❌ $49-125/month or usage limits</li>
                <li>❌ Generic content creation</li>
                <li>❌ Limited brand management</li>
                <li>❌ Scattered tool ecosystem</li>
                <li>❌ No campaign tracking</li>
                <li>❌ Individual user focus</li>
                <li>❌ Manual SEO optimization needed</li>
                <li>❌ Slower generation times</li>
                <li>❌ Limited learning capability</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="cm-process">
          <h2>How Sreve's Content Marketing AI Works</h2>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Define Your Goals</h3>
              <p>
                Tell us what you want to create — blog posts, social content, ads, or complete campaigns. Specify your audience, tone, and marketing objectives.
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">2</div>
              <h3>AI Analyzes & Creates</h3>
              <p>
                Our performance marketing AI researches your topic, analyzes top-performing content, and creates optimized marketing material tailored to your goals.
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Review & Refine</h3>
              <p>
                Get your content in seconds. Review, edit if needed, or regenerate variations. The AI learns your preferences and improves with each use.
              </p>
            </div>

            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Publish & Track</h3>
              <p>
                Deploy your content across channels. Track performance, see what resonates, and use insights to create even better content marketing in the future.
              </p>
            </div>
          </div>
        </section>

        <section className="cm-use-cases">
          <h2>Content Marketing AI Use Cases</h2>

          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>📝 Blog Content at Scale</h3>
              <p>
                Marketing agencies need 50+ blog posts monthly for clients. Sreve generates SEO-optimized, client-specific blog content in minutes instead of days.
              </p>
              <span className="use-case-result">→ 70% faster blog production, 85% cost reduction</span>
            </div>

            <div className="use-case-card">
              <h3>📱 Social Media Campaigns</h3>
              <p>
                E-commerce brands require daily social posts across 4-5 platforms. Create month's worth of on-brand social content in one session with AI.
              </p>
              <span className="use-case-result">→ 30-day content calendar in 20 minutes</span>
            </div>

            <div className="use-case-card">
              <h3>💰 Performance Ad Copy</h3>
              <p>
                SaaS companies test 100+ ad variations monthly. Generate high-converting ad copy with multiple hooks, benefits, and CTAs for A/B testing.
              </p>
              <span className="use-case-result">→ 10x more ad variations, 40% better CTR</span>
            </div>

            <div className="use-case-card">
              <h3>📧 Email Marketing Sequences</h3>
              <p>
                Build complete email nurture sequences, promotional campaigns, and newsletters tailored to different audience segments in minutes.
              </p>
              <span className="use-case-result">→ Complete 7-email sequence in 10 minutes</span>
            </div>

            <div className="use-case-card">
              <h3>🎥 Video & UGC Scripts</h3>
              <p>
                Content creators need scroll-stopping video scripts and UGC content. Generate viral-worthy scripts optimized for TikTok, Reels, and YouTube.
              </p>
              <span className="use-case-result">→ 50 video concepts in 15 minutes</span>
            </div>

            <div className="use-case-card">
              <h3>🏢 Multi-Client Management</h3>
              <p>
                Agencies juggle 10-20 client brands with unique voices. Manage all brand guidelines, content histories, and campaigns in one centralized platform.
              </p>
              <span className="use-case-result">→ 60% faster client content delivery</span>
            </div>
          </div>
        </section>

        <section className="cm-faq">
          <h2>Content Marketing AI: Frequently Asked Questions</h2>

          <div className="faq-container">
            <div className="faq-item">
              <h3>What is content marketing AI?</h3>
              <p>
                Content marketing AI uses artificial intelligence to automate and enhance content creation, distribution, and optimization. Sreve's platform helps marketers create blog posts, social media content, ad copy, and more using advanced AI models trained specifically for performance marketing that converts.
              </p>
            </div>

            <div className="faq-item">
              <h3>How is Sreve different from Jasper AI for content marketing?</h3>
              <p>
                Sreve costs just $19/month compared to Jasper's $49-125/month, saving you 90% while providing the same quality output. We focus specifically on <strong>performance marketing content that converts</strong>, not generic writing. Plus, our agency-friendly features let you manage multiple brand voices in one platform. See our detailed <Link href="/blog/cheaper-jasper-alternative-2025">Jasper AI alternative comparison</Link>.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can AI replace my content marketing team?</h3>
              <p>
                AI should enhance your team, not replace it. Sreve handles time-consuming tasks like first drafts, ideation, and variations, freeing your team to focus on strategy, editing, and high-level creative work. Most agencies see 70% faster content production while maintaining quality. Learn more in our <Link href="/blog/content-marketing-strategy-agencies">AI content marketing strategy guide</Link>.
              </p>
            </div>

            <div className="faq-item">
              <h3>What types of content can I create with Sreve?</h3>
              <p>
                Sreve creates blog posts, social media content (LinkedIn, Twitter, Instagram), ad copy, email campaigns, video scripts, UGC scripts, product descriptions, landing page copy, and more. All content is optimized for your specific marketing goals and brand voice. Explore our <Link href="/tools">complete tool collection</Link>.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is AI-generated content good for SEO?</h3>
              <p>
                Yes! Google doesn't penalize AI content as long as it's helpful, original, and provides value. Sreve's content marketing AI creates SEO-optimized content with proper keyword integration, natural language, and comprehensive coverage that ranks well in search engines. Read our <Link href="/blog/ai-content-seo-best-practices">AI content SEO guide</Link>.
              </p>
            </div>

            <div className="faq-item">
              <h3>How much does content marketing AI cost compared to traditional methods?</h3>
              <p>
                Traditional content creation costs $50-500 per blog post, $100-300 per social campaign, and $200-1000 for ad copy packages. Sreve costs just $19/month for unlimited content, saving agencies and businesses thousands monthly. Our <Link href="/blog/scale-content-marketing-budget">budget content marketing guide</Link> shows the complete cost breakdown.
              </p>
            </div>

            <div className="faq-item">
              <h3>Can I manage multiple brands/clients with Sreve?</h3>
              <p>
                Absolutely! Sreve is built for agencies and in-house teams managing multiple brands. Create separate brand profiles with unique voice guidelines, content histories, and campaign tracking. Switch between clients seamlessly while maintaining consistency for each brand.
              </p>
            </div>

            <div className="faq-item">
              <h3>What makes Sreve better for content marketing than ChatGPT?</h3>
              <p>
                ChatGPT is a general AI assistant. Sreve is specifically trained for performance marketing content with built-in SEO optimization, brand voice consistency, campaign management, and marketing-specific workflows. Plus, you get 20+ specialized tools instead of one generic chatbot. See our <Link href="/blog/best-ai-tools-content-marketing-2025">AI content marketing tools comparison</Link>.
              </p>
            </div>
          </div>
        </section>

        <section className="cm-final-cta">
          <h2>Start Creating Better Content Marketing Today</h2>
          <p className="cta-subtitle">
            Join 2,800+ marketers who save time and money with AI content marketing
          </p>

          <SignedIn>
            <Link href="/app" className="final-cta-button">
              Go to Your Dashboard →
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="final-cta-button">
                Start Free Trial - No Credit Card Required
              </button>
            </SignInButton>
          </SignedOut>

          <p className="cta-trust">
            ✓ Free plan available • ✓ Pro plan $19/month • ✓ Cancel anytime • ✓ 90% cheaper than Jasper
          </p>
        </section>

        <section className="cm-resources">
          <h2>Content Marketing Resources & Related Tools</h2>

          <div className="resources-grid">
            <div className="resource-column">
              <h3>📚 Content Marketing Guides</h3>
              <ul className="resource-links">
                <li><Link href="/blog/ultimate-content-marketing-guide-2025">→ Ultimate Content Marketing Guide 2025</Link></li>
                <li><Link href="/blog/content-marketing-tools-comparison">→ Best Content Marketing Tools Comparison</Link></li>
                <li><Link href="/blog/content-marketing-strategy-agencies">→ AI Content Marketing for Agencies</Link></li>
                <li><Link href="/blog/scale-content-marketing-budget">→ Scale Content Marketing on a Budget</Link></li>
              </ul>
            </div>

            <div className="resource-column">
              <h3>🛠️ Content Creation Tools</h3>
              <ul className="resource-links">
                <li><Link href="/tools/blog-generator">→ AI Blog Post Generator</Link></li>
                <li><Link href="/tools/social-media-post-generator">→ Social Media Post Generator</Link></li>
                <li><Link href="/tools/viral-post-generator">→ Viral Post Generator</Link></li>
                <li><Link href="/tools/ai-content-generator">→ AI Content Generator</Link></li>
                <li><Link href="/tools">→ View All 20+ Tools</Link></li>
              </ul>
            </div>

            <div className="resource-column">
              <h3>💡 Marketing Insights</h3>
              <ul className="resource-links">
                <li><Link href="/blog/cheaper-jasper-alternative-2025">→ Why Sreve is 90% Cheaper Than Jasper</Link></li>
                <li><Link href="/blog/top-5-tools-for-creative-and-marketing-agencies">→ Top Tools for Marketing Agencies</Link></li>
                <li><Link href="/blog/ai-content-seo-best-practices">→ AI Content SEO Best Practices</Link></li>
                <li><Link href="/blog">→ All Marketing Articles</Link></li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
