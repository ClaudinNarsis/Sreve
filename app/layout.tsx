export const metadata = {
  title: 'Sreve - Creative Targeting Made Simple',
  description: 'Generate UGC scripts, hooks, ad copy, and fresh ideas — all in your brand’s voice.',
  icons: {
    icon: '/assets/favicon.png'
  }
};

import './globals.css';
import Script from 'next/script';
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/style.css" />
        <Script id="ms-clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "rjguvuzjgr");
        `}</Script>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17102136063" strategy="afterInteractive" />
        <Script id="gtm-gtag" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17102136063');
        `}</Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
