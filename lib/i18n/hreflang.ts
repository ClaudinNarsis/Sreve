import { i18n, type Locale } from './config';

export function generateHreflangLinks(currentPath: string, currentLocale: Locale) {
  const baseUrl = 'https://sreve.online';

  // Remove current locale from path to get the base path
  const pathWithoutLocale = currentPath.replace(`/${currentLocale}`, '') || '/';

  const hreflangLinks = i18n.locales.map((locale) => {
    const href = `${baseUrl}/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    const hreflang = locale === 'en' ? 'en-US' : locale === 'ar' ? 'ar-SA' : 'fr-FR';

    return {
      rel: 'alternate',
      hrefLang: hreflang,
      href,
    };
  });

  // Add x-default
  hreflangLinks.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}/en${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`,
  });

  return hreflangLinks;
}

export function getLocalizedMetadata(locale: Locale, path: string) {
  const titles: Record<Locale, string> = {
    en: 'Sreve - AI Creative Co-pilot for Marketing Agencies',
    ar: 'Sreve - المساعد الإبداعي بالذكاء الاصطناعي لوكالات التسويق',
    fr: 'Sreve - Co-pilote créatif IA pour les agences marketing',
  };

  const descriptions: Record<Locale, string> = {
    en: 'Generate scroll-stopping UGC scripts, hooks, ad copy, and fresh creative ideas — all in your brand\'s voice. The AI tool that thinks like a strategist, not a robot.',
    ar: 'قم بإنشاء نصوص UGC جذابة، عناوين رئيسية، نسخ إعلانية، وأفكار إبداعية جديدة — كلها بصوت علامتك التجارية. أداة الذكاء الاصطناعي التي تفكر كاستراتيجي.',
    fr: 'Générez des scripts UGC captivants, des accroches, des copies publicitaires et des idées créatives fraîches — le tout dans la voix de votre marque.',
  };

  const localeMapping: Record<Locale, string> = {
    en: 'en_US',
    ar: 'ar_SA',
    fr: 'fr_FR',
  };

  return {
    title: titles[locale],
    description: descriptions[locale],
    locale: localeMapping[locale],
    alternates: {
      canonical: `https://sreve.online/${locale}${path}`,
      languages: Object.fromEntries(
        i18n.locales.map(loc => [
          loc === 'en' ? 'en-US' : loc === 'ar' ? 'ar-SA' : 'fr-FR',
          `https://sreve.online/${loc}${path}`
        ])
      ),
    },
  };
}
