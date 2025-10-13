export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ar', 'fr'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  fr: '🇫🇷',
};

export function isValidLocale(locale: string): locale is Locale {
  return i18n.locales.includes(locale as Locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  return i18n.defaultLocale;
}

export function removeLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const potentialLocale = segments[0];

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return '/' + segments.slice(1).join('/');
  }

  return pathname;
}
