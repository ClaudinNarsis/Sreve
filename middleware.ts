import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { i18n, isValidLocale } from './lib/i18n/config';

const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/(.*)',
  '/sign-in',
  '/sign-up',
  '/onboarding(.*)',
  '/api/health',
  '/api/url-metadata',
  '/sample-responses.json',
  '/sample',
  '/privacy-policy',
  '/blog(.*)',
  '/sitemap.xml',
  '/tools(.*)',
  '/resources(.*)'
]);

function getLocale(request: NextRequest): string {
  // Check if pathname already has a locale
  const pathname = request.nextUrl.pathname;
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const potentialLocale = pathnameSegments[0];

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  // Check cookie for saved preference
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && isValidLocale(localeCookie)) {
    return localeCookie;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
    for (const lang of languages) {
      const shortLang = lang.split('-')[0];
      if (isValidLocale(shortLang)) {
        return shortLang;
      }
    }
  }

  return i18n.defaultLocale;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const potentialLocale = pathnameSegments[0];

  // Skip middleware for certain paths
  const skipPaths = ['/api', '/sign-in', '/sign-up', '/onboarding', '/app', '/_next', '/assets'];
  if (skipPaths.some(path => pathname.startsWith(path))) {
    if (!isPublicRoute(req)) {
      const authObj = await auth();
      if (!authObj.userId) {
        return NextResponse.redirect(new URL('/sign-in', req.url));
      }
    }
    return NextResponse.next();
  }

  // Handle locale redirection for public pages
  const hasLocale = potentialLocale && isValidLocale(potentialLocale);

  // Define routes that have localized versions available
  const localizedRoutes = [
    '', // homepage only
  ];

  if (!hasLocale) {
    // Only redirect to localized version if it's a route we've localized
    const pathWithoutLeadingSlash = pathname.replace(/^\//, '');
    const isLocalizedRoute = localizedRoutes.some(route =>
      pathWithoutLeadingSlash === route ||
      pathWithoutLeadingSlash.startsWith(route + '/')
    );

    if (isLocalizedRoute || pathname === '/') {
      // Redirect to localized version
      const locale = getLocale(req);
      const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url);

      const response = NextResponse.redirect(newUrl);
      response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 }); // 1 year
      return response;
    } else {
      // Non-localized route, let it pass through
      // But still set the locale cookie for preference tracking
      const locale = getLocale(req);
      const response = NextResponse.next();
      response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 });
      return response;
    }
  }

  // FALLBACK LOGIC: If localized page doesn't exist, try non-localized version
  // This allows gradual migration - if /en/tools doesn't exist, fall back to /tools
  if (hasLocale) {
    const pathWithoutLocale = '/' + pathnameSegments.slice(1).join('/');

    // Try to proceed with the localized request first
    const response = NextResponse.next();

    // Add headers that can be checked by a not-found handler
    response.headers.set('x-locale', potentialLocale);
    response.headers.set('x-fallback-path', pathWithoutLocale || '/');
    response.headers.set('x-has-fallback', 'true');

    return response;
  }

  // Handle authentication for protected routes
  if (!isPublicRoute(req)) {
    const authObj = await auth();
    if (!authObj.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  // Handle root path with authentication
  if (pathname === '/') {
    const authObj = await auth();

    if (authObj.userId) {
      const onboardingComplete = req.cookies.get('onboarding_complete');

      if (onboardingComplete) {
        return NextResponse.redirect(new URL('/app', req.url));
      } else {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }

    // Redirect unauthenticated users to localized homepage
    const locale = getLocale(req);
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};