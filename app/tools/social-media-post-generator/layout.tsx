import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Social Media Post Generator - Create Viral Posts in Seconds | Sreve',
  description: 'Generate engaging social media posts for all platforms with our AI generator. Create viral content that drives engagement and grows your brand across Instagram, Facebook, LinkedIn.',
  keywords: [
    'social media post generator',
    'viral post generator',
    'social media content',
    'Instagram post generator',
    'Facebook post generator',
    'LinkedIn post generator',
    'social media marketing',
    'engagement content',
    'viral content creator',
    'social media automation'
  ],
  openGraph: {
    title: 'Social Media Post Generator - Create Viral Posts in Seconds',
    description: 'Generate engaging social media posts for all platforms. Create viral content that drives engagement and grows your brand.',
    url: 'https://sreve.online/tools/social-media-post-generator',
    siteName: 'Sreve',
    images: [
      {
        url: '/assets/og-social-media-generator.png',
        width: 1200,
        height: 630,
        alt: 'Social Media Post Generator by Sreve',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Post Generator - Create Viral Posts in Seconds',
    description: 'Generate engaging social media posts for all platforms. Create viral content that drives engagement.',
    images: ['/assets/twitter-social-media-generator.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools/social-media-post-generator',
  },
}

export default function SocialMediaPostGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="social-media-generator-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Social Media Post Generator",
          "description": "Generate engaging social media posts for all platforms. Create viral content that drives engagement and grows your brand.",
          "url": "https://sreve.online/tools/social-media-post-generator",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "name": "Free Social Media Post Generator"
          },
          "provider": {
            "@type": "Organization",
            "name": "Sreve",
            "url": "https://sreve.online"
          },
          "featureList": [
            "Multi-platform content",
            "Viral post creation",
            "Engagement optimization",
            "Brand voice matching",
            "Platform-specific formats"
          ]
        })}
      </Script>
      {children}
    </>
  )
}