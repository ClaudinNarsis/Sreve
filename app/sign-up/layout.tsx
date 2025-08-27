import { Metadata } from 'next';
import '../sign-in/sign-in.css';

export const metadata: Metadata = {
  title: 'Sign Up Free - Sreve | AI Creative Co-pilot for Marketing Agencies',
  description: 'Join Sreve for free and start creating scroll-stopping UGC scripts, hooks, and ad copy with AI that thinks like a strategist. 20 free ideas monthly.',
  keywords: [
    'sign up sreve free',
    'free ai copywriting',
    'marketing ai signup',
    'agency ai free trial',
    'performance marketing signup'
  ],
  openGraph: {
    title: 'Sign Up Free - Sreve | AI Creative Co-pilot for Marketing Agencies',
    description: 'Get started with Sreve for free. Create high-converting ad copy and marketing content with AI. 20 free ideas monthly.',
    url: 'https://sreve.online/sign-up',
    type: 'website',
  },
  twitter: {
    title: 'Sign Up Free - Sreve | AI Creative Co-pilot',
    description: 'Get started with Sreve for free. Create high-converting ad copy and marketing content with AI.',
  },
  alternates: {
    canonical: 'https://sreve.online/sign-up',
  },
  robots: {
    index: false, // Don't index sign-up pages
    follow: true,
  }
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sign-in-layout">
      {children}
    </div>
  );
}