import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Idea Generator Tool - Never Run Out of Content Ideas | Sreve',
  description: 'Generate endless blog post ideas with our AI-powered blog idea generator. Get trending topics, SEO-optimized titles, and content angles for any niche.',
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
    title: 'Blog Idea Generator Tool - Never Run Out of Content Ideas',
    description: 'Generate endless blog post ideas with our AI-powered generator. Get trending topics and SEO-optimized titles for any niche.',
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
    title: 'Blog Idea Generator Tool - Never Run Out of Content Ideas',
    description: 'Generate endless blog post ideas with trending topics and SEO-optimized titles for any niche.',
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
  return children
}