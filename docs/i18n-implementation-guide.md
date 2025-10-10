# Internationalization (i18n) Implementation Guide

## Overview

The Sreve platform now supports multi-language localization for **English (en)**, **Arabic (ar)**, and **French (fr)**. This guide explains how the system works and how to add new languages or localized pages.

## Architecture

### URL Structure

All public pages are now available in three languages with URL patterns:

- **English**: `/en/` → `/en/tools/` → `/en/blog/`
- **Arabic**: `/ar/` → `/ar/tools/` → `/ar/blog/`
- **French**: `/fr/` → `/fr/tools/` → `/fr/blog/`

### Key Components

1. **i18n Configuration** (`/lib/i18n/config.ts`)
   - Defines supported locales
   - Locale validation utilities
   - Path manipulation helpers

2. **Translation Dictionaries** (`/lib/i18n/dictionaries.ts`)
   - TypeScript types for translations
   - Async dictionary loading

3. **Translation Files** (`/locales/`)
   - `/locales/en.json` - English translations
   - `/locales/ar.json` - Arabic translations
   - `/locales/fr.json` - French translations

4. **Middleware** (`/middleware.ts`)
   - Language detection (cookie → Accept-Language header → default)
   - Automatic redirection to localized URLs
   - Cookie-based language persistence

5. **Localized Components**
   - `LocalizedHeader` - Multi-language header with navigation
   - `LocalizedFooter` - Multi-language footer
   - `LanguageSwitcher` - Dropdown to switch languages

## Language Detection Flow

1. **User visits root domain** (`https://sreve.online/`)
2. **Middleware checks**:
   - Does URL already have a locale? → Use it
   - Does user have `NEXT_LOCALE` cookie? → Use it
   - Check `Accept-Language` header → Use matching locale
   - Default to `en`
3. **Redirect to localized URL** (`/en/`, `/ar/`, `/fr/`)
4. **Save preference in cookie** (1-year expiry)

## How to Add a New Language

### Step 1: Update Configuration

Edit `/lib/i18n/config.ts`:

```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ar', 'fr', 'es'], // Add 'es' for Spanish
} as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  es: 'Español', // Add Spanish
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦',
  fr: '🇫🇷',
  es: '🇪🇸', // Add Spanish flag
};
```

### Step 2: Create Translation File

Create `/locales/es.json`:

```json
{
  "common": {
    "signIn": "Iniciar sesión",
    "signUp": "Registrarse",
    "getStarted": "Comenzar",
    ...
  },
  "nav": { ... },
  "footer": { ... },
  "home": { ... },
  "tools": { ... }
}
```

### Step 3: Update Dictionary Loader

Edit `/lib/i18n/dictionaries.ts`:

```typescript
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  ar: () => import('@/locales/ar.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
  es: () => import('@/locales/es.json').then((module) => module.default), // Add Spanish
};
```

### Step 4: Update SEO Metadata

Edit `/lib/i18n/hreflang.ts` to add locale-specific metadata:

```typescript
const titles: Record<Locale, string> = {
  en: '...',
  ar: '...',
  fr: '...',
  es: 'Sreve - Co-piloto creativo de IA para agencias de marketing',
};
```

## How to Create a Localized Page

### Example: Creating a Localized Tool Page

1. **Create the page file**: `/app/[lang]/tools/my-tool/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import LocalizedHeader from '@/app/components/LocalizedHeader';
import LocalizedFooter from '@/app/components/LocalizedFooter';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

interface MyToolPageProps {
  params: { lang: Locale };
}

export default function MyToolPage({ params }: MyToolPageProps) {
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    async function loadDictionary() {
      const dictionary = await getDictionary(params.lang);
      setDict(dictionary);
    }
    loadDictionary();
  }, [params.lang]);

  if (!dict) return <div>Loading...</div>;

  return (
    <>
      <LocalizedHeader dict={dict} lang={params.lang} />

      <main>
        <h1>{dict.tools.myToolTitle}</h1>
        {/* Your content here */}
      </main>

      <LocalizedFooter dict={dict} lang={params.lang} />
    </>
  );
}
```

2. **Add translations** to each locale file:

```json
// /locales/en.json
{
  "tools": {
    "myToolTitle": "My Awesome Tool"
  }
}

// /locales/ar.json
{
  "tools": {
    "myToolTitle": "أداتي الرائعة"
  }
}

// /locales/fr.json
{
  "tools": {
    "myToolTitle": "Mon super outil"
  }
}
```

## RTL Support for Arabic

The system automatically applies RTL (right-to-left) styling for Arabic:

### Automatic RTL Features

1. **Direction attribute**: `<div lang="ar" dir="rtl">`
2. **CSS rules**: Global CSS includes `[dir="rtl"]` selectors
3. **Flexbox reversal**: Navigation and layouts mirror automatically
4. **Text alignment**: Right-aligned text for Arabic

### CSS RTL Rules (in `/app/globals.css`)

```css
/* RTL Support */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .header,
[dir="rtl"] .nav-links {
  flex-direction: row-reverse;
}

[dir="rtl"] .nav-links a {
  margin-left: 0;
  margin-right: 1.5rem;
}
```

## SEO & Metadata

### Hreflang Tags

Each page automatically includes hreflang alternate links:

```html
<link rel="alternate" hrefLang="en-US" href="https://sreve.online/en/tools" />
<link rel="alternate" hrefLang="ar-SA" href="https://sreve.online/ar/tools" />
<link rel="alternate" hrefLang="fr-FR" href="https://sreve.online/fr/tools" />
<link rel="alternate" hrefLang="x-default" href="https://sreve.online/en/tools" />
```

### Localized Schema.org

Add language-specific structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "inLanguage": "ar",
  "url": "https://sreve.online/ar/page"
}
```

## Language Switcher Component

The `LanguageSwitcher` component is automatically included in `LocalizedHeader`:

- **Current language indicator** with flag and name
- **Dropdown menu** with all available languages
- **Active state highlighting**
- **Automatic page transition** when language is changed
- **Mobile responsive** (hides language name on small screens)

## Migration Strategy

### Moving Existing Pages to Localized Structure

1. **Move page files** from `/app/page.tsx` to `/app/[lang]/page.tsx`
2. **Update imports** to use localized components
3. **Replace hardcoded text** with translation keys
4. **Add locale parameter** to all page components
5. **Update internal links** to include language prefix

### Example Migration

**Before:**
```tsx
// /app/tools/page.tsx
export default function ToolsPage() {
  return <h1>AI Marketing Tools</h1>;
}
```

**After:**
```tsx
// /app/[lang]/tools/page.tsx
export default function ToolsPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  return <h1>{dict.tools.title}</h1>;
}
```

## Best Practices

### 1. Always Use Translation Keys
❌ Don't: `<h1>AI Marketing Tools</h1>`
✅ Do: `<h1>{dict.tools.title}</h1>`

### 2. Include Language in All Internal Links
❌ Don't: `<Link href="/tools">Tools</Link>`
✅ Do: `<Link href={`/${lang}/tools`}>Tools</Link>`

### 3. Use Semantic Translation Keys
❌ Don't: `dict.text1`, `dict.heading2`
✅ Do: `dict.home.hero.title`, `dict.tools.captionGenerator`

### 4. Test RTL Layout
Always test Arabic version to ensure:
- Text flows right-to-left correctly
- Icons and images are properly mirrored
- Navigation menus work intuitively

### 5. Keep Translations Consistent
- Use the same tone and style across languages
- Maintain brand voice in all translations
- Keep technical terms consistent

## File Structure

```
sreve/
├── app/
│   ├── [lang]/                    # Localized pages
│   │   ├── layout.tsx             # Lang-specific layout
│   │   ├── page.tsx               # Localized homepage
│   │   ├── tools/                 # Localized tools pages
│   │   └── blog/                  # Localized blog pages
│   ├── components/
│   │   ├── LocalizedHeader.tsx    # i18n header
│   │   ├── LocalizedFooter.tsx    # i18n footer
│   │   └── LanguageSwitcher.tsx   # Language dropdown
│   └── globals.css                # Global + RTL styles
├── lib/
│   └── i18n/
│       ├── config.ts              # i18n configuration
│       ├── dictionaries.ts        # Translation loader
│       └── hreflang.ts            # SEO utilities
├── locales/
│   ├── en.json                    # English translations
│   ├── ar.json                    # Arabic translations
│   └── fr.json                    # French translations
├── middleware.ts                  # Language detection
└── next.config.js                 # i18n config
```

## Testing Checklist

- [ ] All pages accessible in all 3 languages
- [ ] Language switcher works on every page
- [ ] Arabic displays properly in RTL
- [ ] URLs include correct language prefix
- [ ] Hreflang tags present in HTML
- [ ] Schema.org includes `inLanguage`
- [ ] Cookie persists language choice
- [ ] Mobile responsive in all languages
- [ ] Navigation links include language prefix
- [ ] No hardcoded text in components

## Troubleshooting

### Issue: Page not found after adding locale
**Solution**: Ensure the page exists in `/app/[lang]/` directory

### Issue: Translations not loading
**Solution**: Check that the locale file exists in `/locales/` and is imported in `dictionaries.ts`

### Issue: RTL not working for Arabic
**Solution**: Verify `[dir="rtl"]` CSS rules are present in `globals.css`

### Issue: Language switcher redirects to 404
**Solution**: Ensure all locales are defined in `i18n.locales` array

### Issue: Cookie not persisting language
**Solution**: Check middleware is setting `NEXT_LOCALE` cookie with correct maxAge

## Future Enhancements

- [ ] Add more languages (Spanish, German, Chinese)
- [ ] Implement server-side translation loading
- [ ] Add translation management system (i18next, Crowdin)
- [ ] Create translation completion dashboard
- [ ] Add locale-specific currency formatting
- [ ] Implement date/time localization
- [ ] Add locale-specific content (case studies, testimonials)

---

**Note**: This is a complete implementation guide. For questions or issues, refer to the code in `/lib/i18n/` or consult the Next.js i18n documentation.
