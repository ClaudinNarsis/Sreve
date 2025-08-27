import { Metadata } from 'next';
import './sign-in.css';

export const metadata: Metadata = {
  title: 'Sign In - Sreve | AI Creative Co-pilot for Marketing Agencies',
  description: 'Sign in to your Sreve account and start creating scroll-stopping UGC scripts, hooks, and ad copy with AI that thinks like a strategist.',
  keywords: [
    'sign in sreve',
    'login ai copywriting',
    'marketing ai login',
    'agency ai sign in',
    'performance marketing login'
  ],
  openGraph: {
    title: 'Sign In - Sreve | AI Creative Co-pilot for Marketing Agencies',
    description: 'Access your Sreve account to create high-converting ad copy and marketing content with AI.',
    url: 'https://sreve.online/sign-in',
    type: 'website',
  },
  twitter: {
    title: 'Sign In - Sreve | AI Creative Co-pilot',
    description: 'Access your Sreve account to create high-converting ad copy and marketing content with AI.',
  },
  alternates: {
    canonical: 'https://sreve.online/sign-in',
  },
  robots: {
    index: false, // Don't index sign-in pages
    follow: true,
  }
};

export default function SignInLayout({
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