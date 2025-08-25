import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'AI Content Creation Tools - Sentence Rewriter, Caption Generator & More | Sreve',
  description: 'Discover our collection of AI-powered content creation tools. From sentence rewriting to social media posts, supercharge your content workflow with advanced AI technology.',
  keywords: [
    'AI content creation tools',
    'content creation software',
    'AI writing tools',
    'social media tools',
    'content marketing tools',
    'AI copywriting tools',
    'content automation',
    'marketing tools',
    'AI content suite',
    'writing assistant tools'
  ],
  openGraph: {
    title: 'AI Content Creation Tools - Sentence Rewriter, Caption Generator & More',
    description: 'Discover our collection of AI-powered content creation tools. Supercharge your content workflow with advanced AI technology.',
    url: 'https://sreve.online/tools',
    siteName: 'Sreve',
    images: [
      {
        url: '/assets/og-tools.png',
        width: 1200,
        height: 630,
        alt: 'AI Content Creation Tools by Sreve',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Content Creation Tools - Sentence Rewriter, Caption Generator & More',
    description: 'Discover our collection of AI-powered content creation tools. Supercharge your content workflow.',
    images: ['/assets/twitter-tools.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools',
  },
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="tools-page-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "AI Content Creation Tools",
          "description": "Discover our collection of AI-powered content creation tools. From sentence rewriting to social media posts, supercharge your content workflow.",
          "url": "https://sreve.online/tools",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": 5,
            "itemListElement": [
              {
                "@type": "SoftwareApplication",
                "position": 1,
                "name": "AI Sentence Rewriter Tool",
                "url": "https://sreve.online/tools/ai-sentence-rewriter"
              },
              {
                "@type": "SoftwareApplication",
                "position": 2,
                "name": "AI Caption Generator",
                "url": "https://sreve.online/tools/ai-caption-generator"
              },
              {
                "@type": "SoftwareApplication",
                "position": 3,
                "name": "Blog Idea Generator",
                "url": "https://sreve.online/tools/blog-idea-generator"
              },
              {
                "@type": "SoftwareApplication",
                "position": 4,
                "name": "AI Content Generator",
                "url": "https://sreve.online/tools/ai-content-generator"
              },
              {
                "@type": "SoftwareApplication",
                "position": 5,
                "name": "Social Media Post Generator",
                "url": "https://sreve.online/tools/social-media-post-generator"
              }
            ]
          },
          "provider": {
            "@type": "Organization",
            "name": "Sreve",
            "url": "https://sreve.online"
          }
        })}
      </Script>
      {children}
    </>
  )
}