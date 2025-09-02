import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free AI Blog Generator - Create SEO-Optimized Blog Posts | Sreve',
  description: 'Generate high-quality, SEO-optimized blog posts instantly with our AI blog generator. Create engaging content for your website, save time, and boost your rankings. Free to try.',
  keywords: 'blog generator, AI blog writer, content generator, SEO blog posts, automated blogging, AI writing tool, blog content creator',
  openGraph: {
    title: 'Free AI Blog Generator - Create SEO-Optimized Blog Posts | Sreve',
    description: 'Generate high-quality, SEO-optimized blog posts instantly with our AI blog generator. Create engaging content for your website, save time, and boost your rankings.',
    type: 'website',
    url: 'https://sreve.online/tools/blog-generator',
    siteName: 'Sreve'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Blog Generator - Create SEO-Optimized Blog Posts | Sreve',
    description: 'Generate high-quality, SEO-optimized blog posts instantly with our AI blog generator. Free to try.',
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
      {children}
    </div>
  )
}