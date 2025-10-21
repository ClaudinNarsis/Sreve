import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Writing Sounds Robotic? This AI Rewrites It in 3 Seconds',
  description: 'Stop struggling with awkward sentences. Our AI instantly rewrites them to sound natural, clear, and professional—no sign-up needed. 10,000 rewrites/month FREE.',
  keywords: [
    'AI sentence rewriter',
    'sentence rewriter tool',
    'rewrite sentences online',
    'AI text rewriter',
    'paraphrasing tool',
    'sentence improvement',
    'writing assistant',
    'content rewriting',
    'grammar improvement',
    'text enhancement'
  ],
  openGraph: {
    title: 'Your Writing Sounds Robotic? This AI Rewrites It in 3 Seconds',
    description: 'Stop struggling with awkward sentences. Our AI instantly rewrites them to sound natural and professional—10,000 rewrites/month FREE.',
    url: 'https://sreve.online/tools/ai-sentence-rewriter',
    siteName: 'Sreve',
    images: [
      {
        url: '/assets/og-sentence-rewriter.png',
        width: 1200,
        height: 630,
        alt: 'AI Sentence Rewriter Tool by Sreve',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Writing Sounds Robotic? This AI Rewrites It in 3 Seconds',
    description: 'Stop struggling with awkward sentences. Our AI instantly rewrites them—10,000 FREE rewrites/month.',
    images: ['/assets/twitter-sentence-rewriter.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools/ai-sentence-rewriter',
  },
}