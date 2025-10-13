'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import LanguageSwitcher from './LanguageSwitcher';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

interface LocalizedHeaderProps {
  dict: Dictionary;
  lang: Locale;
}

export default function LocalizedHeader({ dict, lang }: LocalizedHeaderProps) {
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    window.location.href = url;
  };

  return (
    <header className="header">
      <Link href={`/${lang}`} aria-label="Sreve home">
        <Image
          src="/assets/logo.png"
          alt="Sreve Logo"
          className="logo"
          width={120}
          height={40}
          priority
        />
      </Link>
      <nav className="nav-links" aria-label="Primary">
        <a href={`/${lang}#features`}>{dict.common.product}</a>
        <a href="/tools" onClick={(e) => handleNavigation(e, '/tools')}>{dict.common.tools}</a>
        <a href={`/${lang}#pricing`}>{dict.common.pricing}</a>
        <a href="/blog" onClick={(e) => handleNavigation(e, '/blog')}>{dict.common.blog}</a>
        <a href={`/${lang}#contact-us`}>{dict.common.contactUs}</a>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LanguageSwitcher />
        <SignedOut>
          <SignInButton mode="modal">
            <button className="cta-button">{dict.common.signIn}</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/app">
            <button className="cta-button go-to-app-button">{dict.common.goToApp}</button>
          </Link>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
