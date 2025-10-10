'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import LocalizedHeader from '../components/LocalizedHeader';
import LocalizedFooter from '../components/LocalizedFooter';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import '../page.css';

const LazyTestimonials = dynamic(() => import('../components/LazyTestimonials'), {
  ssr: false,
  loading: () => <div className="lazy-testimonials-loading" />
});

interface HomePageProps {
  params: Promise<{ lang: Locale }>;
}

export default function LocalizedHomePage({ params }: HomePageProps) {
  const resolvedParams = use(params);
  const lang = resolvedParams.lang;
  const [dict, setDict] = useState<Dictionary | null>(null);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    async function loadDictionary() {
      const dictionary = await getDictionary(lang);
      setDict(dictionary);
    }
    loadDictionary();
  }, [lang]);

  // Clear any stale sessionStorage data
  useEffect(() => {
    const keysToCheck = ['pendingPrompt', 'pendingPromptTimestamp'];
    keysToCheck.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value && key.includes('Timestamp')) {
        const timestamp = parseInt(value);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (timestamp < fiveMinutesAgo) {
          sessionStorage.removeItem(key);
          sessionStorage.removeItem(key.replace('Timestamp', ''));
        }
      }
    });
  }, []);

  // Check for pending prompts
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      sessionStorage.removeItem('pendingPrompt');
      sessionStorage.removeItem('pendingPromptTimestamp');
      return;
    }

    const checkPendingPromptOnLanding = () => {
      const pendingPrompt = sessionStorage.getItem('pendingPrompt');
      const pendingTimestamp = sessionStorage.getItem('pendingPromptTimestamp');

      if (pendingPrompt && pendingTimestamp) {
        const timestamp = parseInt(pendingTimestamp);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (timestamp > fiveMinutesAgo) {
          router.push('/app');
        } else {
          sessionStorage.removeItem('pendingPrompt');
          sessionStorage.removeItem('pendingPromptTimestamp');
        }
      }
    };

    const timer = setTimeout(checkPendingPromptOnLanding, 2000);
    return () => clearTimeout(timer);
  }, [router, isLoaded, isSignedIn]);

  const handleGenerateClick = () => {
    const promptInput = document.querySelector<HTMLElement>('.prompt-input');
    const inputText = promptInput?.innerText?.trim() || '';

    if (inputText && isLoaded && isSignedIn) {
      sessionStorage.setItem('pendingPrompt', inputText);
      sessionStorage.setItem('pendingPromptTimestamp', Date.now().toString());
      router.push('/app');
    } else if (inputText && isLoaded && !isSignedIn) {
      sessionStorage.setItem('pendingPrompt', inputText);
      sessionStorage.setItem('pendingPromptTimestamp', Date.now().toString());
      const signInButton = document.querySelector<HTMLButtonElement>('.signup-button');
      signInButton?.click();
    }
  };

  useEffect(() => {
    if (!dict) return;
    const chips = document.querySelectorAll<HTMLButtonElement>('.chip');
    const promptInput = document.querySelector<HTMLElement>('.prompt-input');
    chips.forEach(chip => chip.addEventListener('click', () => { if (promptInput) promptInput.innerText = chip.innerText; }));
  }, [dict]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 0) header.classList.add('sticky');
      else header.classList.remove('sticky');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const gtagClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, url: string) => {
    e.preventDefault();
    if (url.startsWith('#')) {
      const targetElement = document.getElementById(url.substring(1));
      targetElement?.scrollIntoView({ behavior: 'smooth' });
    } else if (url === 'signup') {
      router.push('/sign-up');
    } else {
      setTimeout(() => { window.location.href = url; }, 20);
    }
  };

  if (!dict) {
    const loadingText = lang === 'ar' ? 'جاري التحميل...' : lang === 'fr' ? 'Chargement...' : 'Loading...';
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: '#000' }}>{loadingText}</div>;
  }

  return (
    <>
      <LocalizedHeader dict={dict} lang={lang} />

      <section className="hero" id="hero">
        <div className="container">
          <p className="hero-intro">{dict.home.hero.intro}</p>
          <h1 className="hero-title">
            {dict.home.hero.title} <span className="brand-name">{dict.home.hero.titleBrand}</span> {dict.home.hero.titleEnd}
          </h1>
          <p className="hero-subtitle">{dict.home.hero.subtitle}</p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="signup-button">{dict.home.hero.cta}</button>
            </SignInButton>
          </SignedOut>
          <div className="prompt-box">
            <div className="prompt-input-container">
              <div className="prompt-input" contentEditable data-placeholder={dict.home.hero.promptPlaceholder}></div>
              <div className="chips-wrapper">
                <div className="prompt-chips">
                  <button className="chip">{dict.home.hero.chipAd}</button>
                  <button className="chip">{dict.home.hero.chipStatic}</button>
                  <button className="chip">{dict.home.hero.chipUGC}</button>
                </div>
              </div>
            </div>
            <button className="generate-button" onClick={handleGenerateClick}>{dict.common.generate}</button>
          </div>
          <div className="hero-trust-link">
            <a href="#demo-video-section" className="theme-link">{dict.home.hero.trustLink}</a>
            <p className="hero-blog-link">
              <a href="/blog" onClick={(e) => { e.preventDefault(); window.location.href = '/blog'; }}>{dict.home.hero.blogLink}</a>
              {' | '}
              <a href="/blog/cheaper-jasper-alternative-2025" onClick={(e) => { e.preventDefault(); window.location.href = '/blog/cheaper-jasper-alternative-2025'; }}>{dict.home.hero.jasperLink}</a>
              {' | '}
              <a href="/tools" onClick={(e) => { e.preventDefault(); window.location.href = '/tools'; }}>{dict.home.hero.exploreTools}</a>
            </p>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <h2 className="features-title">{dict.home.features.title}</h2>
          <div className="features-grid">
            <article className="feature">
              <h3>{dict.home.features.feature1Title}</h3>
              <p>{dict.home.features.feature1Desc}</p>
              <button className="cta-button" onClick={(e) => gtagClick(e, 'signup')}>{dict.common.tryNow}</button>
              <Image src="/assets/1-1.png" alt={dict.home.features.feature1Title} width={400} height={300} loading="lazy" />
            </article>
            <article className="feature">
              <h3>{dict.home.features.feature2Title}</h3>
              <p>{dict.home.features.feature2Desc}</p>
              <button className="cta-button" onClick={(e) => gtagClick(e, 'signup')}>{dict.common.tryNow}</button>
              <Image src="/assets/1-2.png" alt={dict.home.features.feature2Title} width={400} height={300} loading="lazy" />
            </article>
            <article className="feature">
              <h3>{dict.home.features.feature3Title}</h3>
              <p>{dict.home.features.feature3Desc}</p>
              <button className="cta-button" onClick={(e) => gtagClick(e, 'signup')}>{dict.common.tryNow}</button>
              <Image src="/assets/1-3.png" alt={dict.home.features.feature3Title} width={400} height={300} loading="lazy" />
            </article>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section packages features">
        <div className="container">
          <h2>{dict.home.pricing.title}</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>{dict.home.pricing.litePlan}</h3>
              <p className="price-discounted">{dict.home.pricing.litePrice}</p>
              <p className="price-per-month">{dict.home.pricing.litePeriod}</p>
              <ul>
                <li>{dict.home.pricing.liteFeature1}</li>
                <li>{dict.home.pricing.liteFeature2}</li>
              </ul>
              <button className="cta-button secondary-cta" onClick={(e) => gtagClick(e, 'signup')}>{dict.common.tryNowForFree}</button>
              <p className="no-credit-card">{dict.common.startFree}</p>
            </div>
            <div className="pricing-card popular">
              <h3>{dict.home.pricing.proPlan}</h3>
              <p className="price-discounted">{dict.home.pricing.proPrice}</p>
              <p className="price-per-month">{dict.home.pricing.proPeriod}</p>
              <ul>
                <li>{dict.home.pricing.proFeature1}</li>
                <li>{dict.home.pricing.proFeature2}</li>
              </ul>
              <button className="cta-button secondary-cta" onClick={(e) => gtagClick(e, 'signup')}>{dict.common.tryNowForFree}</button>
              <p className="no-credit-card">{dict.common.startFree}</p>
            </div>
          </div>
        </div>
      </section>

      <LazyTestimonials />

      <section className="final-cta-section" id="contact-us">
        <h3>{dict.home.finalCta.title}</h3>
        <div className="final-cta">
          <p className="cta-note">{dict.home.finalCta.note}</p>
          <div className="container contact-box">
            <p className="contact-text">{dict.home.finalCta.contactText}</p>
            <button className="cta-button" onClick={(e) => gtagClick(e, 'https://calendly.com/claudinnarsis/sreve-onboarding')}>{dict.common.contactUs}</button>
          </div>
        </div>
      </section>

      <LocalizedFooter dict={dict} lang={lang} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${dict.home.hero.title} ${dict.home.hero.titleBrand} ${dict.home.hero.titleEnd}`,
            description: dict.home.hero.subtitle,
            inLanguage: lang,
            url: `https://sreve.online/${lang}`,
          }),
        }}
      />
    </>
  );
}
