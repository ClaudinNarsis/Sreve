import { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Stop Writing from Scratch — Generate SEO Blog Posts in 90 Seconds (Free)',
  description: 'Writing 2,000-word blogs takes 4 hours. Our AI does it in 90 seconds—SEO-optimized, engaging, ready to publish. 10,000 words FREE/month. No sign-up. Actually ranks on Google.',
  keywords: 'blog generator, AI blog writer, content generator, SEO blog posts, automated blogging, AI writing tool, blog content creator',
  openGraph: {
    title: 'Stop Writing from Scratch — Generate SEO Blog Posts in 90 Seconds',
    description: 'Writing blogs takes 4 hours. Our AI does it in 90 seconds—10,000 words FREE/month.',
    type: 'website',
    url: 'https://sreve.online/tools/blog-generator',
    siteName: 'Sreve'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop Writing from Scratch — Generate Blogs in 90 Seconds (Free)',
    description: 'AI-generated blog posts that rank. 10,000 words FREE/month.',
    creator: '@sreve_ai'
  },
  alternates: {
    canonical: 'https://sreve.online/tools/blog-generator'
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Script id="blog-generator-faq-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Does AI-generated blog content actually rank on Google in 2025?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Google doesn't penalize AI content—it penalizes low-quality content. Our AI blog generator creates SEO-optimized posts with proper structure, keyword placement, and engaging readability that ranks just like human-written content. Over 5,000 sites use our generated blogs and rank on page 1."
              }
            },
            {
              "@type": "Question",
              "name": "How can you claim blogs are generated in 90 seconds when most AI tools take 10+ minutes?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Other AI tools require you to manually prompt, structure, edit, and format. Our blog generator handles everything: researching the topic, creating outlines, writing engaging intros, generating SEO-optimized headers, adding conclusions, and formatting—all in one click. You get a publish-ready 2,000-word blog in 90 seconds, not a messy first draft."
              }
            },
            {
              "@type": "Question",
              "name": "Is 10,000 words per month really enough for a business blog?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "10,000 words FREE is enough for 5 high-quality 2,000-word blog posts monthly—perfect for most small businesses and startups. If you need more (agencies managing multiple clients), our Pro plan at $19/month gives you 200,000 words (100 blog posts) which is 90% cheaper than Jasper AI or Copy.ai."
              }
            },
            {
              "@type": "Question",
              "name": "Will these AI blog posts sound robotic or need heavy editing?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. Our AI is trained specifically for marketing and blogging—not generic text generation. It writes in a natural, engaging style with strategic hooks, clear explanations, and persuasive conclusions. Most users publish with minimal editing (10-15 minutes to add personal examples or update statistics)."
              }
            }
          ]
        })}
      </Script>
      {children}
    </div>
  )
}