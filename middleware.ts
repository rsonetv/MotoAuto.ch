import { createServerClient } from '@supabase/ssr';
import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  // Apply internationalization first
  const intlResponse = intlMiddleware(req);

  // If intl middleware handled the request (redirect/rewrite), respect it
  if (intlResponse.status !== 200) {
    return intlResponse;
  }

  // Continue with auth handling
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Extract locale from pathname
  const locale = req.nextUrl.pathname.split('/')[1];
  const isValidLocale = ['pl', 'de', 'fr', 'en', 'it'].includes(locale);

  // Handle auth routes - consider locale in paths
  const isAuthRoute = req.nextUrl.pathname.includes('/auth');
  const isDashboard = req.nextUrl.pathname.includes('/dashboard');

  if (!session && isDashboard) {
    const loginUrl = isValidLocale 
      ? new URL(`/${locale}/auth/login`, req.url)
      : new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthRoute && !req.nextUrl.pathname.includes('/auth/callback')) {
    const dashboardUrl = isValidLocale 
      ? new URL(`/${locale}/dashboard`, req.url)
      : new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for all requests that have a locale prefix
    '/(de|en|fr|it|pl)/:path*',

    // Enable redirects that add missing locales (e.g. `/pathnames` -> `/pl/pathnames`)
    '/((?!_next|_vercel|.*\.).*)'
  ]
};
