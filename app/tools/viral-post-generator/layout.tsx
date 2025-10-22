import { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: '10 Views Per Post? This AI Creates Content That Gets 100K+ (Free)',
  description: 'Your posts are invisible. Our AI creates viral hooks, scroll-stopping angles, and psychological triggers that get shared 1,000+ times. Proven by 500+ creators hitting millions of views.',
  keywords: 'viral post generator, social media post generator, LinkedIn post generator, viral content creator, engaging posts, social media AI, viral marketing tool',
  openGraph: {
    title: '10 Views Per Post? This AI Creates Content That Gets 100K+',
    description: 'Viral hooks, scroll-stopping angles, psychological triggers. 500+ creators hitting millions of views.',
    type: 'website',
    url: 'https://sreve.online/tools/viral-post-generator',
    siteName: 'Sreve'
  },
  twitter: {
    card: 'summary_large_image',
    title: '10 Views Per Post? This AI Creates Content That Gets 100K+',
    description: 'Viral hooks that get 1,000+ shares. Used by 500+ creators. FREE.',
    creator: '@sreve_ai'
  },
  alternates: {
    canonical: 'https://sreve.online/tools/viral-post-generator'
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Script id="viral-post-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Why do my social media posts only get 10-50 views when others get 100K+?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Low engagement happens because most posts lack viral triggers: emotional hooks, pattern interrupts, curiosity gaps, and social proof. Our AI viral post generator is trained on millions of high-performing posts and creates content with proven psychological triggers that make people stop scrolling, engage, and share. It's the difference between 'Here's my product' and 'You've been doing this wrong your whole life.'"
              }
            },
            {
              "@type": "Question",
              "name": "Can AI really create viral content or does it just copy existing posts?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our AI doesn't copy—it understands the psychology behind virality. It analyzes what makes content spread (controversy, surprising insights, emotional resonance, actionable value) and creates original posts using those proven frameworks. Over 500 creators use our generated content and consistently hit 100K+ impressions. The AI gives you the viral structure; you add your unique angle."
              }
            },
            {
              "@type": "Question",
              "name": "Will this work for LinkedIn, Twitter, Instagram, and TikTok?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Each platform has different viral triggers. LinkedIn loves contrarian opinions and career insights. Twitter thrives on hot takes and thread-worthy content. Instagram needs visual storytelling and relatability. TikTok requires hooks in the first 3 seconds. Our AI adapts the content format, tone, and structure for each platform to maximize engagement."
              }
            },
            {
              "@type": "Question",
              "name": "How many viral posts can I generate for free?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You get 20 viral posts per month on the free plan—enough to post consistently and test what resonates with your audience. Our Pro plan ($19/month) gives you 200 viral posts monthly plus advanced features like A/B testing hooks, trend analysis, and performance tracking. That's 6+ viral posts per day for less than the cost of one sponsored post."
              }
            }
          ]
        })}
      </Script>
      {children}
    </div>
  )
}