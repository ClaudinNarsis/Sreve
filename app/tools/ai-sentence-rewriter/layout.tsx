import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Sentence Rewriter Tool - Rewrite Any Sentence Instantly | Sreve',
  description: 'Transform your sentences with our advanced AI sentence rewriter. Improve clarity, change tone, and avoid repetition while preserving meaning. Free to use with instant results.',
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
    title: 'AI Sentence Rewriter Tool - Rewrite Any Sentence Instantly',
    description: 'Transform your sentences with our advanced AI sentence rewriter. Improve clarity, change tone, and avoid repetition while preserving meaning.',
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
    title: 'AI Sentence Rewriter Tool - Rewrite Any Sentence Instantly',
    description: 'Transform your sentences with our advanced AI sentence rewriter. Improve clarity, change tone, and avoid repetition.',
    images: ['/assets/twitter-sentence-rewriter.png'],
  },
  alternates: {
    canonical: 'https://sreve.online/tools/ai-sentence-rewriter',
  },
}

export default function SentenceRewriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}