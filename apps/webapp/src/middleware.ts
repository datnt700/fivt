import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { isApiRoute } from '@/config/routes';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Skip API routes and static files
  if (isApiRoute(request.nextUrl.pathname) || 
      request.nextUrl.pathname.startsWith('/_next') ||
      request.nextUrl.pathname.startsWith('/_vercel') ||
      request.nextUrl.pathname.includes('.')) {
    return;
  }

  // Apply internationalization middleware for all other routes
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};