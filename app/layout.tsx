import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  metadataBase: new URL('https://sreve.online'),
  title: {
    default: 'Sreve - AI Creative Co-pilot for Marketing Agencies',
    template: '%s | Sreve'
  },
  description: 'Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas — all in your brand\'s voice. The AI tool that thinks like a strategist, not a robot.',
  keywords: [
    'AI copywriting',
    'marketing agency AI',
    'ad copy generator',
    'UGC scripts',
    'creative AI tools',
    'performance marketing',
    'agency AI',
    'copy AI',
    'marketing automation',
    'creative co-pilot'
  ],
  authors: [{ name: 'Sreve Team' }],
  creator: 'Sreve',
  publisher: 'Sreve',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sreve.online',
    siteName: 'Sreve',
    title: 'Sreve - AI Creative Co-pilot for Marketing Agencies',
    description: 'Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas — all in your brand\'s voice. The AI tool that thinks like a strategist, not a robot.',
    images: [
      {
        url: '/assets/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sreve - AI Creative Co-pilot for Marketing Agencies',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sreve - AI Creative Co-pilot for Marketing Agencies',
    description: 'Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas — all in your brand\'s voice.',
    images: ['/assets/twitter-image.png'],
    creator: '@sreve_ai',
    site: '@sreve_ai',
  },
  icons: {
    icon: [
      { url: '/assets/favicon.png' },
      { url: '/assets/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://sreve.online',
  },
  category: 'technology',
};

import './globals.css';
import Script from 'next/script';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preload" href="/assets/style.css" as="style" />
          <link rel="stylesheet" href="/assets/style.css" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.clarity.ms" />
          <Script id="ms-clarity" strategy="lazyOnload">{`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "rjguvuzjgr");
          `}</Script>
          <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17102136063" strategy="afterInteractive" />
          <Script id="gtm-gtag" strategy="lazyOnload">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', 'AW-17102136063');
          `}</Script>
          <Script id="organization-schema" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Sreve",
              "alternateName": "Sreve AI",
              "url": "https://sreve.online",
              "logo": "https://sreve.online/assets/logo.png",
              "description": "AI creative co-pilot for marketing agencies. Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas in your brand's voice.",
              "foundingDate": "2024",
              "industry": "Artificial Intelligence, Marketing Technology",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+919487731230",
                "contactType": "Customer Service",
                "availableLanguage": ["English"]
              },
              "sameAs": [
                "https://twitter.com/sreve_ai"
              ],
              "service": {
                "@type": "Service",
                "name": "AI Copywriting and Creative Generation",
                "description": "AI-powered creative content generation for marketing agencies and performance marketers"
              }
            })}
          </Script>
          <Script id="website-schema" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Sreve",
              "url": "https://sreve.online",
              "description": "AI creative co-pilot for marketing agencies. Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas.",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://sreve.online/blog?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Sreve",
                "logo": "https://sreve.online/assets/logo.png"
              }
            })}
          </Script>
          <Script id="software-app-schema" type="application/ld+json" strategy="afterInteractive">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Sreve AI Creative Co-pilot",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "url": "https://sreve.online",
              "description": "AI creative co-pilot that generates scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas for marketing agencies.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "name": "Free Beta Access"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "500",
                "bestRating": "5"
              },
              "creator": {
                "@type": "Organization",
                "name": "Sreve"
              }
            })}
          </Script>
        </head>
        <body>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
