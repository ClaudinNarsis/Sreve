import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'AI Caption Generator for Social Media - Create Engaging Captions | Sreve',
  description: 'Generate captivating captions for Instagram, TikTok, LinkedIn, and more. Our AI understands your brand voice and creates scroll-stopping captions that drive engagement.',
  keywords: [
    'AI caption generator',
    'social media captions',
    'Instagram caption generator',
    'TikTok captions',
    'LinkedIn captions',
    'social media content',
    'caption writing tool',
    'social media marketing',
    'engagement captions',
    'brand voice captions'
  ],
  openGraph: {
    title: 'AI Caption Generator for Social Media - Create Engaging Captions',
    description: 'Generate captivating captions for Instagram, TikTok, LinkedIn, and more. Our AI creates scroll-stopping captions that drive engagement.',
    url: 'https://sreve.online/tools/ai-caption-generator',
    siteName: 'Sreve',
    images: [
      {
        url: '/assets/og-caption-generator.png',
        width: 1200,
        height: 630,
        alt: 'AI Caption Generator for Social Media by Sreve',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Caption Generator for Social Media - Create Engaging Captions',
    description: 'Generate captivating captions for Instagram, TikTok, LinkedIn, and more with our AI caption generator.',
    images: ['/assets/twitter-caption-generator.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools/ai-caption-generator',
  },
}

export default function CaptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="caption-generator-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "AI Caption Generator for Social Media",
          "description": "Generate captivating captions for Instagram, TikTok, LinkedIn, and more. Our AI creates scroll-stopping captions that drive engagement.",
          "url": "https://sreve.online/tools/ai-caption-generator",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "name": "Free AI Caption Generator"
          },
          "provider": {
            "@type": "Organization",
            "name": "Sreve",
            "url": "https://sreve.online"
          },
          "featureList": [
            "Instagram captions",
            "TikTok captions",
            "LinkedIn captions",
            "Twitter captions",
            "Brand voice matching",
            "Hashtag suggestions"
          ]
        })}
      </Script>
      {children}
    </>
  )
}