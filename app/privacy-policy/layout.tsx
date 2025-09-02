import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Data Protection & User Rights',
  description: 'Learn how Sreve protects your personal data, respects your privacy, and complies with data protection regulations. Transparent privacy practices for our users.',
  keywords: [
    'privacy policy',
    'data protection',
    'user privacy',
    'GDPR compliance',
    'data security',
    'personal information'
  ],
  openGraph: {
    title: 'Privacy Policy - Data Protection & User Rights | Sreve',
    description: 'Learn how Sreve protects your personal data and respects your privacy rights.',
    url: 'https://sreve.online/privacy-policy',
    type: 'website',
  },
  twitter: {
    title: 'Privacy Policy - Data Protection & User Rights | Sreve',
    description: 'Learn how Sreve protects your personal data and respects your privacy rights.',
  },
  alternates: {
    canonical: 'https://sreve.online/privacy-policy',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}