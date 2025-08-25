import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'AI Content Generator Tool - Create High-Quality Content Instantly | Sreve',
  description: 'Generate compelling articles, blog posts, and marketing content with our advanced AI content generator. Create long-form content that engages your audience in minutes.',
  keywords: [
    'AI content generator',
    'content creation tool',
    'article generator',
    'blog post generator',
    'long-form content',
    'AI writing assistant',
    'marketing content',
    'content automation',
    'copywriting tool',
    'AI writer'
  ],
  openGraph: {
    title: 'AI Content Generator Tool - Create High-Quality Content Instantly',
    description: 'Generate compelling articles, blog posts, and marketing content with our advanced AI content generator.',
    url: 'https://sreve.online/tools/ai-content-generator',
    siteName: 'Sreve',
    images: [
      {
        url: '/assets/og-content-generator.png',
        width: 1200,
        height: 630,
        alt: 'AI Content Generator Tool by Sreve',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Generator Tool - Create High-Quality Content Instantly',
    description: 'Generate compelling articles, blog posts, and marketing content with our advanced AI content generator.',
    images: ['/assets/twitter-content-generator.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools/ai-content-generator',
  },
}

export default function ContentGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="content-generator-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Content Generator Tool",
          "description": "Generate compelling articles, blog posts, and marketing content with our advanced AI content generator.",
          "url": "https://sreve.online/tools/ai-content-generator",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "name": "Free AI Content Generator"
          },
          "provider": {
            "@type": "Organization",
            "name": "Sreve",
            "url": "https://sreve.online"
          },
          "featureList": [
            "Long-form content",
            "Blog articles",
            "Marketing copy",
            "SEO optimization",
            "Multi-language support"
          ]
        })}
      </Script>
      {children}
    </>
  )
}