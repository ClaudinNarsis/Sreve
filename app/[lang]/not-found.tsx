'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isValidLocale } from '@/lib/i18n/config';

export default function LocalizedNotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Extract locale and path
    const segments = pathname.split('/').filter(Boolean);
    const potentialLocale = segments[0];

    if (potentialLocale && isValidLocale(potentialLocale)) {
      // Remove locale from path to get fallback path
      const fallbackPath = '/' + segments.slice(1).join('/');

      // If fallbackPath exists (not just locale), try to redirect to non-localized version
      if (fallbackPath && fallbackPath !== '/') {
        console.log(`[i18n Fallback] Localized page not found at ${pathname}, trying fallback: ${fallbackPath}`);

        // Redirect to non-localized version
        setTimeout(() => {
          router.push(fallbackPath);
        }, 100);
      } else {
        // Just the locale segment, redirect to base path
        setTimeout(() => {
          router.push('/');
        }, 100);
      }
    }
  }, [pathname, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem' }}>
        Page not found. Redirecting to available version...
      </p>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(255, 102, 0, 0.3)',
        borderTop: '4px solid #ff6600',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
