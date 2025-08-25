import type { Metadata } from 'next'

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
  return children
}