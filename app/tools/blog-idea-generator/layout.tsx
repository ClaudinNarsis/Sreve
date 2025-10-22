import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Staring at a Blank Screen? Get 50 Blog Ideas in 10 Seconds',
  description: 'Writer\'s block is costing you traffic. Our AI generates 50 SEO-optimized blog ideas instantly—trending topics, viral angles, and content gaps your competitors missed. FREE.',
  keywords: [
    'blog idea generator',
    'blog post ideas',
    'content ideas',
    'blog topics',
    'SEO blog titles',
    'content planning',
    'blogging tools',
    'content strategy',
    'blog inspiration',
    'content creation'
  ],
  openGraph: {
    title: 'Staring at a Blank Screen? Get 50 Blog Ideas in 10 Seconds',
    description: 'Writer\'s block is costing you traffic. Our AI generates 50 SEO blog ideas instantly—FREE.',
    url: 'https://sreve.online/tools/blog-idea-generator',
    siteName: 'Sreve',
    images: [
      {
        url: '/assets/og-blog-idea-generator.png',
        width: 1200,
        height: 630,
        alt: 'Blog Idea Generator Tool by Sreve',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Staring at a Blank Screen? Get 50 Blog Ideas in 10 Seconds',
    description: 'AI-generated blog ideas that rank. Trending topics, viral angles, FREE.',
    images: ['/assets/twitter-blog-idea-generator.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools/blog-idea-generator',
  },
}

export default function BlogIdeaGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Script id="blog-idea-generator-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Blog Idea Generator Tool",
          "description": "Generate endless blog post ideas with trending topics and SEO-optimized titles for any niche.",
          "url": "https://sreve.online/tools/blog-idea-generator",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "name": "Free Blog Idea Generator"
          },
          "provider": {
            "@type": "Organization",
            "name": "Sreve",
            "url": "https://sreve.online"
          },
          "featureList": [
            "SEO-optimized titles",
            "Trending topics",
            "Niche-specific ideas",
            "Content outlines",
            "Bulk generation"
          ]
        })}
      </Script>
      <Script id="blog-idea-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Why am I always staring at a blank screen when trying to think of blog topics?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Writer's block happens because manually brainstorming blog ideas is mentally exhausting and time-consuming. Our AI blog idea generator analyzes trending topics, competitor gaps, and search data to instantly give you 50 SEO-optimized ideas in 10 seconds—so you never waste hours stuck in ideation mode."
              }
            },
            {
              "@type": "Question",
              "name": "Will these AI-generated blog ideas actually rank on Google?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Our AI analyzes real search trends, keyword difficulty, and content gaps to suggest topics that have proven ranking potential. Each idea comes with SEO-optimized titles and angles that align with what people are actually searching for. Over 3,000 bloggers use these ideas to rank on page 1."
              }
            },
            {
              "@type": "Question",
              "name": "How is this different from just using Google or BuzzSumo?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Google and BuzzSumo show you what's popular—but you still have to manually analyze and brainstorm angles. Our AI does the heavy lifting: it finds trending topics, identifies content gaps your competitors missed, generates viral angles, and gives you ready-to-write titles. It's like having a content strategist who works in 10 seconds instead of 10 hours."
              }
            },
            {
              "@type": "Question",
              "name": "Can I use this for multiple niches or just one topic?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can generate blog ideas for any niche—marketing, health, tech, finance, lifestyle, e-commerce, SaaS, you name it. Just tell the AI your industry or topic, and it'll generate 50 niche-specific ideas with angles tailored to your audience."
              }
            }
          ]
        })}
      </Script>
      {children}
    </>
  )
}