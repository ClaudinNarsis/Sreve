import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Viral Post Generator - Create Engaging Social Media Posts | Sreve',
  description: 'Generate viral-worthy social media posts instantly with our AI viral post generator. Create engaging LinkedIn posts, Twitter content, and Facebook posts that get maximum engagement. Free to try.',
  keywords: 'viral post generator, social media post generator, LinkedIn post generator, viral content creator, engaging posts, social media AI, viral marketing tool',
  openGraph: {
    title: 'Free Viral Post Generator - Create Engaging Social Media Posts | Sreve',
    description: 'Generate viral-worthy social media posts instantly with our AI viral post generator. Create engaging content that gets maximum engagement.',
    type: 'website',
    url: 'https://sreve.online/tools/viral-post-generator',
    siteName: 'Sreve'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Viral Post Generator - Create Engaging Social Media Posts | Sreve',
    description: 'Generate viral-worthy social media posts instantly with our AI viral post generator. Free to try.',
    creator: '@sreve_ai'
  },
  alternates: {
    canonical: 'https://sreve.online/tools/viral-post-generator'
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