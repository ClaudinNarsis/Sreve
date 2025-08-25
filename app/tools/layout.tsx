import type { Metadata } from 'next'

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
  return children
}