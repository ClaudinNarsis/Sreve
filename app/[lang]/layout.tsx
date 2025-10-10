import { i18n, type Locale, isValidLocale } from '@/lib/i18n/config';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    return {};
  }

  const titles: Record<Locale, string> = {
    en: 'Sreve - AI Creative Co-pilot for Marketing Agencies',
    ar: 'Sreve - المساعد الإبداعي بالذكاء الاصطناعي لوكالات التسويق',
    fr: 'Sreve - Co-pilote créatif IA pour les agences marketing',
  };

  const descriptions: Record<Locale, string> = {
    en: 'Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas — all in your brand\'s voice. The AI tool that thinks like a strategist, not a robot.',
    ar: 'قم بإنشاء نصوص UGC جذابة، عناوين رئيسية، نسخ إعلانية، وأفكار إبداعية جديدة — كلها بصوت علامتك التجارية.',
    fr: 'Générez des scripts UGC captivants, des accroches, des copies publicitaires et des idées créatives fraîches — le tout dans la voix de votre marque.',
  };

  return {
    title: titles[lang],
    description: descriptions[lang],
    openGraph: {
      locale: lang === 'en' ? 'en_US' : lang === 'ar' ? 'ar_SA' : 'fr_FR',
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div lang={lang} dir={dir}>
      {children}
    </div>
  );
}
