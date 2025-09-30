import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { isApiRoute } from '@/config/routes';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Skip API routes, protected routes, and static files
  if (
    isApiRoute(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith('/banking') ||
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/transactions') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/chatbot') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/_vercel') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return;
  }

  // Apply internationalization middleware for other routes
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except API, protected routes, and static files
  matcher: [
    '/((?!api|banking|dashboard|transactions|chatbot|_next|_vercel|.*\\..*).*)',
  ],
};
