# Localization Instructions - How to Add New Localized Pages

## 🎯 Quick Overview

This guide shows you exactly how to localize any page in your Next.js app. The system supports **English (en)**, **Arabic (ar)**, and **French (fr)** with automatic RTL support for Arabic.

## 📁 Current Status

### ✅ Already Localized
- **Homepage**: `/app/[lang]/page.tsx` - Available at `/en/`, `/ar/`, `/fr/`

### ⏳ Not Yet Localized (Using Original Pages)
- Tools: `/tools` → `/app/tools/page.tsx`
- Blog: `/blog` → `/app/blog/page.tsx`
- Resources: `/resources` → `/app/resources/page.tsx`
- Privacy Policy: `/privacy-policy` → `/app/privacy-policy/page.tsx`
- Individual tool pages: `/tools/ai-caption-generator`, etc.
- Individual blog posts: `/blog/[slug]`, etc.

---

## 🚀 How to Localize a New Page (Step-by-Step)

### Example: Localizing the Resources Page

#### Step 1: Add Translations to Locale Files

**File: `/locales/en.json`**
```json
{
  "common": { ... },
  "resourcesPage": {
    "title": "Free Marketing Resources",
    "subtitle": "Discover trending audios, templates, and tools to boost your marketing campaigns",
    "viralAudios": {
      "title": "Viral Audio Finder",
      "description": "Find trending audio tracks for your social media content"
    }
  }
}
```

**File: `/locales/ar.json`**
```json
{
  "common": { ... },
  "resourcesPage": {
    "title": "موارد التسويق المجانية",
    "subtitle": "اكتشف الأصوات الرائجة والقوالب والأدوات لتعزيز حملاتك التسويقية",
    "viralAudios": {
      "title": "مكتشف الصوت الفيروسي",
      "description": "ابحث عن المقاطع الصوتية الرائجة لمحتوى وسائل التواصل الاجتماعي"
    }
  }
}
```

**File: `/locales/fr.json`**
```json
{
  "common": { ... },
  "resourcesPage": {
    "title": "Ressources marketing gratuites",
    "subtitle": "Découvrez les audios tendance, modèles et outils pour booster vos campagnes marketing",
    "viralAudios": {
      "title": "Détecteur d'audio viral",
      "description": "Trouvez des pistes audio tendance pour votre contenu sur les réseaux sociaux"
    }
  }
}
```

#### Step 2: Update TypeScript Dictionary Type

**File: `/lib/i18n/dictionaries.ts`**

Add the new section to the `Dictionary` type:

```typescript
export type Dictionary = {
  common: { ... };
  nav: { ... };
  footer: { ... };
  home: { ... };
  toolsPage: { ... };
  blogPage: { ... };

  // Add this:
  resourcesPage: {
    title: string;
    subtitle: string;
    viralAudios: {
      title: string;
      description: string;
    };
  };

  tools: { ... };
};
```

#### Step 3: Create the Localized Page

**File: `/app/[lang]/resources/page.tsx`**

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import LocalizedHeader from '@/app/components/LocalizedHeader';
import LocalizedFooter from '@/app/components/LocalizedFooter';
import '@/app/resources/resources.css'; // Reuse existing CSS

interface ResourcesPageProps {
  params: Promise<{ lang: Locale }>;
}

export default function LocalizedResourcesPage({ params }: ResourcesPageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    async function loadDictionary() {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    }
    loadDictionary();
  }, [lang]);

  if (!dict) {
    const loadingText = lang === 'ar' ? 'جاري التحميل...' : lang === 'fr' ? 'Chargement...' : 'Loading...';
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#000' }}>
        {loadingText}
      </div>
    );
  }

  return (
    <div className="resources-page">
      <LocalizedHeader dict={dict} lang={lang} />

      <main>
        <section className="hero">
          <div className="container">
            <h1>{dict.resourcesPage.title}</h1>
            <p>{dict.resourcesPage.subtitle}</p>
          </div>
        </section>

        <section className="resources-grid">
          <div className="container">
            <Link href={`/${lang}/resources/viral-audios-missing-out`} className="resource-card">
              <h3>{dict.resourcesPage.viralAudios.title}</h3>
              <p>{dict.resourcesPage.viralAudios.description}</p>
            </Link>
            {/* Add more resource cards */}
          </div>
        </section>
      </main>

      <LocalizedFooter dict={dict} lang={lang} />
    </div>
  );
}
```

#### Step 4: Update Middleware to Include New Route

**File: `/middleware.ts`**

Add the new route to the `localizedRoutes` array:

```typescript
// Define routes that have localized versions available
const localizedRoutes = [
  '', // homepage
  'resources', // Add this line
];
```

#### Step 5: Test Your Localized Page

Visit these URLs to test:
- English: `http://localhost:3001/en/resources`
- Arabic: `http://localhost:3001/ar/resources`
- French: `http://localhost:3001/fr/resources`

Test the fallback:
- Visit: `/resources`
- Should redirect to: `/en/resources` (or your preferred language)

---

## 📋 Checklist for Localizing Any Page

- [ ] **Step 1**: Add all text content to `/locales/en.json`, `/locales/ar.json`, `/locales/fr.json`
- [ ] **Step 2**: Update TypeScript types in `/lib/i18n/dictionaries.ts`
- [ ] **Step 3**: Create new page file in `/app/[lang]/your-page/page.tsx`
- [ ] **Step 4**: Use `use(params)` to unwrap params (Next.js 15 requirement)
- [ ] **Step 5**: Load dictionary with `getDictionary(lang)`
- [ ] **Step 6**: Replace all hardcoded text with `dict.yourSection.yourKey`
- [ ] **Step 7**: Add `LocalizedHeader` and `LocalizedFooter`
- [ ] **Step 8**: Prefix all internal links with `/${lang}`
- [ ] **Step 9**: Add route to `localizedRoutes` array in middleware
- [ ] **Step 10**: Test in all three languages

---

## 🔧 Common Patterns & Code Snippets

### Pattern 1: Basic Page Structure

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import LocalizedHeader from '@/app/components/LocalizedHeader';
import LocalizedFooter from '@/app/components/LocalizedFooter';

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export default function LocalizedPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    async function loadDictionary() {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    }
    loadDictionary();
  }, [lang]);

  if (!dict) return <div>Loading...</div>;

  return (
    <>
      <LocalizedHeader dict={dict} lang={lang} />
      <main>{/* Your content */}</main>
      <LocalizedFooter dict={dict} lang={lang} />
    </>
  );
}
```

### Pattern 2: Dynamic Routes (e.g., Blog Posts)

**File: `/app/[lang]/blog/[slug]/page.tsx`**

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

interface BlogPostProps {
  params: Promise<{ lang: Locale; slug: string }>;
}

export default function LocalizedBlogPost({ params }: BlogPostProps) {
  const resolvedParams = use(params);
  const { lang, slug } = resolvedParams;
  const [dict, setDict] = useState<Dictionary | null>(null);

  useEffect(() => {
    async function loadDictionary() {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    }
    loadDictionary();
  }, [lang]);

  if (!dict) return <div>Loading...</div>;

  return (
    <>
      {/* Use slug to fetch post content */}
      {/* Use dict for UI elements */}
    </>
  );
}
```

### Pattern 3: Links in Localized Pages

```tsx
// Internal links - ALWAYS include /${lang}
<Link href={`/${lang}/tools`}>Tools</Link>
<Link href={`/${lang}/blog/some-post`}>Read Post</Link>

// Hash links for same page
<a href="#pricing">Pricing</a>

// External links
<a href="https://example.com" target="_blank" rel="noopener noreferrer">External</a>
```

### Pattern 4: Conditional Content Based on Language

```tsx
// Show different content for different languages
{lang === 'ar' && (
  <div>Arabic-specific content</div>
)}

{lang === 'en' && (
  <div>English-specific content</div>
)}

// Or use translations
<p>{dict.yourSection.description}</p>
```

---

## 🌍 Language-Specific Considerations

### Arabic (RTL) Considerations

1. **Automatic RTL**: The layout automatically becomes RTL when `lang="ar"`
2. **CSS is already configured**: All `[dir="rtl"]` styles are in `/app/globals.css`
3. **Icons**: Some icons may need to be mirrored (already handled in global CSS)
4. **Numbers**: Consider using Arabic numerals if needed:
   ```tsx
   const formatNumber = (num: number) => {
     if (lang === 'ar') {
       return num.toLocaleString('ar-SA');
     }
     return num.toLocaleString('en-US');
   };
   ```

### French Considerations

1. **Apostrophes**: Use proper French typography (`l'`, `d'`, etc.)
2. **Gender**: Ensure adjectives match gender in French
3. **Formal vs Informal**: Use appropriate level of formality (vous vs tu)

---

## 📊 Migration Priority Recommendations

Localize pages in this order for maximum impact:

1. ✅ **Homepage** - DONE
2. 🔄 **Tools Landing Page** (`/tools`) - High traffic
3. 🔄 **Individual Tool Pages** (e.g., `/tools/ai-caption-generator`) - High conversion
4. 🔄 **Blog Landing Page** (`/blog`) - SEO important
5. 🔄 **Top Blog Posts** - Start with most popular
6. 🔄 **Resources Page** - Medium priority
7. 🔄 **Privacy Policy** - Low priority (mostly legal text)

---

## 🐛 Troubleshooting

### Issue: "Cannot read properties of undefined"
**Solution**: Make sure you're using `use(params)` not direct params access
```tsx
// ❌ Wrong
const lang = params.lang;

// ✅ Correct
const resolvedParams = use(params);
const lang = resolvedParams.lang;
```

### Issue: 404 on localized page
**Solution**:
1. Check if route is added to `localizedRoutes` in middleware
2. Verify file is at correct path: `/app/[lang]/your-page/page.tsx`
3. Clear `.next` cache: `rm -rf .next && npm run dev`

### Issue: Translations not showing
**Solution**:
1. Verify JSON is valid (no trailing commas)
2. Check TypeScript types match JSON structure
3. Clear cache and rebuild

### Issue: Arabic not displaying RTL
**Solution**:
1. Check `/app/[lang]/layout.tsx` sets `dir="rtl"` for Arabic
2. Verify RTL CSS rules exist in `/app/globals.css`
3. Test with browser dev tools

---

## 📚 File Structure Reference

```
sreve/
├── app/
│   ├── [lang]/                      # Localized pages
│   │   ├── layout.tsx              # Sets lang and dir attributes
│   │   ├── page.tsx                # Localized homepage ✅
│   │   ├── not-found.tsx           # Fallback handler
│   │   ├── tools/                  # Create this for localized tools
│   │   │   └── page.tsx
│   │   ├── blog/                   # Create this for localized blog
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── resources/              # Create this for localized resources
│   │       └── page.tsx
│   │
│   ├── tools/                      # Original non-localized (keep as fallback)
│   │   └── page.tsx
│   ├── blog/                       # Original non-localized (keep as fallback)
│   │   └── page.tsx
│   │
│   └── components/
│       ├── LocalizedHeader.tsx     # Reusable header
│       ├── LocalizedFooter.tsx     # Reusable footer
│       └── LanguageSwitcher.tsx    # Language dropdown
│
├── lib/
│   └── i18n/
│       ├── config.ts               # Locale configuration
│       ├── dictionaries.ts         # Translation loader + types
│       └── hreflang.ts            # SEO utilities
│
├── locales/
│   ├── en.json                     # English translations
│   ├── ar.json                     # Arabic translations
│   └── fr.json                     # French translations
│
└── middleware.ts                   # Language detection & routing
```

---

## 🎨 SEO Best Practices for Localized Pages

### Add Hreflang Tags

In each localized page:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  return {
    alternates: {
      canonical: `https://sreve.online/${lang}/your-page`,
      languages: {
        'en-US': 'https://sreve.online/en/your-page',
        'ar-SA': 'https://sreve.online/ar/your-page',
        'fr-FR': 'https://sreve.online/fr/your-page',
        'x-default': 'https://sreve.online/en/your-page',
      },
    },
  };
}
```

### Add Localized Schema.org Markup

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{
  __html: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: dict.yourPage.title,
    description: dict.yourPage.subtitle,
    inLanguage: lang,
    url: `https://sreve.online/${lang}/your-page`,
  }),
}} />
```

---

## 🚀 Quick Start Commands

```bash
# Start dev server
npm run dev

# Test localized pages
# Visit: http://localhost:3001/en/
# Visit: http://localhost:3001/ar/
# Visit: http://localhost:3001/fr/

# Build for production
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

## 📞 Need Help?

- **Documentation**: See `/docs/i18n-implementation-guide.md` for detailed technical documentation
- **Examples**: Check `/app/[lang]/page.tsx` for a complete working example
- **Patterns**: All common patterns are shown above

---

## ✅ Final Checklist Before Deployment

- [ ] All translations added to all 3 locale files
- [ ] TypeScript types updated (no errors in `npx tsc --noEmit`)
- [ ] Routes added to `localizedRoutes` in middleware
- [ ] All internal links include `/${lang}` prefix
- [ ] Tested in all 3 languages (EN, AR, FR)
- [ ] Arabic displays RTL correctly
- [ ] Language switcher works on all pages
- [ ] Fallback to non-localized pages works
- [ ] SEO metadata includes hreflang tags
- [ ] Schema.org markup includes `inLanguage`
- [ ] Build succeeds (`npm run build`)

---

**Remember**: You can localize pages gradually. The system will automatically fall back to non-localized versions for pages you haven't migrated yet!

Happy localizing! 🌍🎉
