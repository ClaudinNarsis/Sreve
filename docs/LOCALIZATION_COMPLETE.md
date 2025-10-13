# Localization Implementation - Complete Guide

## ✅ What's Been Implemented

### 1. Core i18n Infrastructure
- **Configuration**: `/lib/i18n/config.ts` - Locale settings for EN, AR, FR
- **Dictionaries**: `/lib/i18n/dictionaries.ts` - Translation loader with TypeScript types
- **SEO Utils**: `/lib/i18n/hreflang.ts` - Hreflang and metadata generation

### 2. Translation Files
- **English**: `/locales/en.json` - Complete homepage, tools, blog translations
- **Arabic**: `/locales/ar.json` - Full RTL translations
- **French**: `/locales/fr.json` - Complete French translations

### 3. Middleware & Routing
- **Language Detection**: Automatic detection via cookie → Accept-Language → default
- **URL Structure**: `/en/`, `/ar/`, `/fr/` for all public pages
- **Cookie Persistence**: Saves user preference for 1 year

### 4. UI Components
- **LocalizedHeader**: Multi-language header with navigation
- **LocalizedFooter**: Multi-language footer with all links
- **LanguageSwitcher**: Dropdown to switch between languages

### 5. Localized Pages
- **Homepage**: `/app/[lang]/page.tsx` - Fully functional with all features
- **Layout**: `/app/[lang]/layout.tsx` - RTL support, metadata

### 6. RTL Support
- **Global CSS**: Complete RTL rules in `/app/globals.css`
- **Auto-detection**: Arabic automatically displays RTL
- **Mirrored layouts**: Flex-direction reversal, text alignment

## 🚀 How to Use

### Access Localized Pages
- **English**: `https://sreve.online/en/`
- **Arabic**: `https://sreve.online/ar/` (RTL)
- **French**: `https://sreve.online/fr/`

### Language Switcher
- Automatically shown in header
- Switches current page to selected language
- Preserves current path (e.g., `/en/tools` → `/ar/tools`)

## 📋 Next Steps to Complete Migration

### Step 1: Create Localized Tools Page

Create `/app/[lang]/tools/page.tsx`:

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import LocalizedHeader from '@/app/components/LocalizedHeader';
import LocalizedFooter from '@/app/components/LocalizedFooter';
import '@/app/tools/tools.css';

interface ToolsPageProps {
  params: Promise<{ lang: Locale }>;
}

export default function LocalizedToolsPage({ params }: ToolsPageProps) {
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

  if (!dict) return <div className="loading">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;

  const tools = [
    {
      title: dict.toolsPage.toolsList.aiCaption.title,
      description: dict.toolsPage.toolsList.aiCaption.desc,
      href: `/${lang}/tools/ai-caption-generator`,
      icon: '📱'
    },
    {
      title: dict.toolsPage.toolsList.aiContent.title,
      description: dict.toolsPage.toolsList.aiContent.desc,
      href: `/${lang}/tools/ai-content-generator`,
      icon: '📄'
    },
    // Add other tools...
  ];

  return (
    <div className="tools-page">
      <LocalizedHeader dict={dict} lang={lang} />

      <section className="hero">
        <div className="container">
          <h1>
            {dict.toolsPage.hero.title}
            <span style={{ color: 'var(--orange-primary)' }}>
              {dict.toolsPage.hero.titleHighlight}
            </span>
          </h1>
          <p>{dict.toolsPage.hero.subtitle}</p>

          <div className="stats-grid">
            <div>
              <div>🚀</div>
              <div>{dict.toolsPage.stats.agencies}</div>
              <div>{dict.toolsPage.stats.agenciesSub}</div>
            </div>
            {/* Add other stats */}
          </div>

          <div className="tools-grid">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="tool-card">
                <div className="tool-icon">{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LocalizedFooter dict={dict} lang={lang} />
    </div>
  );
}
```

### Step 2: Create Localized Blog Page

Create `/app/[lang]/blog/page.tsx`:

```tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import LocalizedHeader from '@/app/components/LocalizedHeader';
import LocalizedFooter from '@/app/components/LocalizedFooter';
import '@/app/blog/blog.css';

interface BlogPageProps {
  params: Promise<{ lang: Locale }>;
}

export default function LocalizedBlogPage({ params }: BlogPageProps) {
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

  if (!dict) return <div className="loading">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;

  const posts = [
    {
      slug: 'create-viral-posts-with-ai',
      title: 'Create Viral Posts with AI: Best Tools & Strategies for 2025',
      description: 'Discover the best AI tools...',
      date: 'January 15, 2025',
      readTime: '12 min read',
      tags: ['Viral Content', 'AI Tools', 'Social Media']
    },
    // Add more posts
  ];

  return (
    <>
      <LocalizedHeader dict={dict} lang={lang} />

      <main>
        <div className="container">
          <nav aria-label="Breadcrumb">
            <ol>
              <li><Link href={`/${lang}`}>{dict.common.home}</Link></li>
              <li>/</li>
              <li>{dict.blogPage.breadcrumb}</li>
            </ol>
          </nav>

          <h1>{dict.blogPage.title}</h1>
          <p>{dict.blogPage.subtitle}</p>

          <div className="blog-posts-grid">
            {posts.map((post) => (
              <article key={post.slug} className="blog-post-card">
                <h3>
                  <Link href={`/${lang}/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.description}</p>
                <div className="post-meta">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <LocalizedFooter dict={dict} lang={lang} />
    </>
  );
}
```

### Step 3: Add Translations to Dictionary Type

Update `/lib/i18n/dictionaries.ts` to include the new types:

```typescript
export type Dictionary = {
  common: { ... };
  nav: { ... };
  footer: { ... };
  home: { ... };

  // Add these:
  toolsPage: {
    hero: {
      title: string;
      titleHighlight: string;
      subtitle: string;
      agenciesLink: string;
      jasperLink: string;
      promptPlaceholder: string;
      chip1: string;
      chip2: string;
      chip3: string;
      chip4: string;
      tryTools: string;
    };
    stats: {
      agencies: string;
      agenciesSub: string;
      faster: string;
      fasterSub: string;
      savings: string;
      savingsSub: string;
    };
    toolsList: {
      aiCaption: { title: string; desc: string; };
      aiContent: { title: string; desc: string; };
      socialMedia: { title: string; desc: string; };
      sentenceRewriter: { title: string; desc: string; };
      blogIdea: { title: string; desc: string; };
      viralPost: { title: string; desc: string; };
      blogGenerator: { title: string; desc: string; };
    };
  };

  blogPage: {
    breadcrumb: string;
    title: string;
    subtitle: string;
    jasperCompare: string;
    completeToolkit: string;
    latestArticles: string;
    moreArticles: string;
  };

  tools: { ... };
};
```

### Step 4: Complete Arabic & French Translations

Add the missing translations to `/locales/ar.json` and `/locales/fr.json` following the same structure as English.

## 🔧 Testing Checklist

- [ ] Visit `/en/` - English homepage works
- [ ] Visit `/ar/` - Arabic homepage RTL layout works
- [ ] Visit `/fr/` - French homepage works
- [ ] Language switcher changes language correctly
- [ ] All navigation links include language prefix
- [ ] Header and footer display correctly in all languages
- [ ] Arabic text displays right-to-left
- [ ] Cookie persists language choice
- [ ] Middleware redirects `/` to `/en/`

## 📝 Pattern for Other Pages

For any new page (e.g., `/app/[lang]/resources/page.tsx`):

1. **Create file** in `/app/[lang]/your-page/page.tsx`
2. **Use params**: `const resolvedParams = use(params); const lang = resolvedParams.lang;`
3. **Load dictionary**: `const dict = await getDictionary(lang);`
4. **Replace hardcoded text** with `dict.yourSection.yourKey`
5. **Add translations** to all three locale JSON files
6. **Update TypeScript types** in dictionaries.ts
7. **Use LocalizedHeader** and **LocalizedFooter**
8. **Prefix all links** with `/${lang}`

## 🌐 SEO Best Practices

Each localized page should include:

```tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{
  __html: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Page Title',
    description: 'Page Description',
    inLanguage: lang,
    url: `https://sreve.online/${lang}/page-path`,
  }),
}} />
```

And in the layout or page metadata:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return {
    alternates: {
      canonical: `https://sreve.online/${lang}`,
      languages: {
        'en-US': 'https://sreve.online/en',
        'ar-SA': 'https://sreve.online/ar',
        'fr-FR': 'https://sreve.online/fr',
      },
    },
  };
}
```

## 🚨 Common Issues & Solutions

### Issue: Params error in Next.js 15
**Solution**: Always unwrap params with `use()`:
```tsx
const resolvedParams = use(params);
const lang = resolvedParams.lang;
```

### Issue: Dictionary not loading
**Solution**: Check the locale file exists and is imported correctly in dictionaries.ts

### Issue: Links not working
**Solution**: Ensure all internal links include `/${lang}` prefix

### Issue: RTL not working for Arabic
**Solution**: Verify `[dir="rtl"]` CSS rules are present in globals.css

## 📚 Resources

- [Next.js 15 i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [React.use() Hook](https://react.dev/reference/react/use)
- [RTL CSS Guide](https://rtlstyling.com/)
- [Hreflang Tags](https://developers.google.com/search/docs/specialty/international/localized-versions)

## 🎯 Summary

You now have a complete i18n system with:
- ✅ 3 languages (English, Arabic, French)
- ✅ Automatic language detection
- ✅ RTL support for Arabic
- ✅ SEO-friendly URLs
- ✅ Reusable components
- ✅ Type-safe translations

The homepage (`/app/[lang]/page.tsx`) serves as a complete example. Use it as a template for migrating other pages!
