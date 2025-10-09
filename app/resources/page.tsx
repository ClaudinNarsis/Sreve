import Link from 'next/link';
import { Metadata } from 'next';
import './resources.css';

export const metadata: Metadata = {
  title: 'Free Marketing Resources & Tools - AI-Powered Insights | Sreve',
  description: 'Discover free marketing resources and interactive tools. Get personalized insights on viral content, trending audios, and performance marketing strategies.',
  keywords: [
    'marketing resources',
    'free marketing tools',
    'viral content analysis',
    'trending audio finder',
    'performance marketing resources',
    'AI marketing insights',
    'content strategy tools'
  ],
  openGraph: {
    title: 'Free Marketing Resources & Tools - AI-Powered Insights | Sreve',
    description: 'Discover free marketing resources and interactive tools. Get personalized insights on viral content, trending audios, and performance marketing strategies.',
    url: 'https://sreve.online/resources',
    type: 'website',
  },
  twitter: {
    title: 'Free Marketing Resources & Tools - AI-Powered Insights | Sreve',
    description: 'Discover free marketing resources and interactive tools. Get personalized insights on viral content, trending audios, and performance marketing strategies.',
  },
  alternates: {
    canonical: 'https://sreve.online/resources',
  },
};

export default function ResourcesPage() {
  const resources = [
    {
      slug: 'viral-audios-missing-out',
      title: 'Viral Audios You\'re Missing Out On',
      description: 'Discover trending audio tracks perfect for your niche. Get personalized recommendations based on your content style and target audience.',
      category: 'Social Media',
      icon: '🎵',
    },
    // Future resources can be added here
  ];

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="resources-hero">
          <div className="container">
            <h1 className="resources-hero-title">
              Free Marketing Resources
            </h1>
            <p className="resources-hero-subtitle">
              Unlock powerful insights with our interactive marketing resources. Each tool provides personalized recommendations
              to help you create viral content, discover trending opportunities, and optimize your marketing strategy.
              <Link href="/blog" className="resources-hero-link">Read our blog</Link> for
              more marketing tips and strategies.
            </p>
          </div>
        </section>

        <div className="container">
          {/* Resources Grid */}
          <div className="resources-grid">
            {resources.map((resource) => (
              <Link
                key={resource.slug}
                href={`/resources/${resource.slug}`}
                className="resource-card-link"
              >
                <article className="resource-card">
                  <span className="resource-icon">{resource.icon}</span>
                  <div className="resource-category">{resource.category}</div>
                  <h3 className="resource-card-title">{resource.title}</h3>
                  <p className="resource-card-description">{resource.description}</p>
                  <div className="resource-card-cta">
                    Get Started <span className="resource-card-arrow">→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Why Use Our Resources Section */}
          <section className="resources-section">
            <h2 className="resources-section-title">Why Use Our Resources?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <h3 className="feature-title">Instant Insights</h3>
                <p className="feature-description">
                  Get personalized recommendations in seconds, no waiting or complex analysis required.
                </p>
              </div>

              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <h3 className="feature-title">Tailored Results</h3>
                <p className="feature-description">
                  Every resource adapts to your specific niche, audience, and content goals.
                </p>
              </div>

              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <h3 className="feature-title">100% Free</h3>
                <p className="feature-description">
                  All resources are completely free to use. No hidden fees or paywalls.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2 className="cta-title">Want More AI-Powered Tools?</h2>
            <p className="cta-description">
              Explore our complete suite of AI content creation tools and start creating scroll-stopping content today.
            </p>
            <Link href="/tools">
              <button className="cta-button">View All Tools</button>
            </Link>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          
            <div className="footer-grid">
              {/* Resources */}
              <div>
                <h4 className="footer-section-title">Free Resources</h4>
                <ul className="footer-links">
                  <li><Link href="/resources/viral-audios-missing-out" className="footer-link">Viral Audio Finder</Link></li>
                  <li><Link href="/resources" className="footer-link">All Resources</Link></li>
                  <li><Link href="/tools" className="footer-link">AI Tools</Link></li>
                  <li><Link href="/blog" className="footer-link">Marketing Blog</Link></li>
                </ul>
              </div>

              {/* AI Tools Section */}
              <div>
                <h4 className="footer-section-title">AI Content Tools</h4>
                <ul className="footer-links">
                  <li><Link href="/tools/ai-caption-generator" className="footer-link">AI Caption Generator</Link></li>
                  <li><Link href="/tools/ai-content-generator" className="footer-link">AI Content Generator</Link></li>
                  <li><Link href="/tools/blog-idea-generator" className="footer-link">Blog Idea Generator</Link></li>
                  <li><Link href="/tools/social-media-post-generator" className="footer-link">Social Media Post Generator</Link></li>
                </ul>
              </div>

              {/* Marketing Topics */}
              <div>
                <h4 className="footer-section-title">Popular Articles</h4>
                <ul className="footer-links">
                  <li><Link href="/blog/cheaper-jasper-alternative-2025" className="footer-link">Jasper AI Alternative</Link></li>
                  <li><Link href="/blog/ai-tools-social-media-marketing-2025" className="footer-link">Social Media AI Tools</Link></li>
                  <li><Link href="/blog/top-5-tools-for-creative-and-marketing-agencies" className="footer-link">Agency Tools Guide</Link></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="footer-section-title">Company</h4>
                <ul className="footer-links">
                  <li><Link href="/" className="footer-link">About Sreve</Link></li>
                  <li><Link href="/#contact-us" className="footer-link">Contact Us</Link></li>
                  <li><Link href="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
                  <li><Link href="/#pricing" className="footer-link">Pricing</Link></li>
                </ul>
              </div>
            </div>
          
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">© 2024 Sreve. All rights reserved. Your go-to resource for AI marketing tools and insights.</p>
        </div>
      </footer>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Free Marketing Resources - Sreve",
            "description": "Interactive marketing resources and tools providing personalized insights for content creators and marketers.",
            "url": "https://sreve.online/resources",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Marketing Resources",
              "description": "Free AI-powered marketing resources and analysis tools",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "WebApplication",
                    "name": "Viral Audios You're Missing Out On",
                    "url": "https://sreve.online/resources/viral-audios-missing-out"
                  }
                }
              ]
            },
            "breadcrumb": {
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
                  "name": "Resources",
                  "item": "https://sreve.online/resources"
                }
              ]
            }
          })
        }}
      />
    </>
  );
}
