import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in', '/onboarding(.*)', '/api/health', '/sample-responses.json', '/sample']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (!isPublicRoute(req)) {
    const authObj = await auth();
    if (!authObj.userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  if (req.nextUrl.pathname === '/') {
    const authObj = await auth();

    if (authObj.userId) {
      const onboardingComplete = req.cookies.get('onboarding_complete');

      if (onboardingComplete) {
        return NextResponse.redirect(new URL('/app', req.url));
      } else {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};