import type { Metadata } from 'next'

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
  return children
}