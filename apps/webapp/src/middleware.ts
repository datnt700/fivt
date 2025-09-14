import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'vi', 'fr'],

  // Used when no locale matches
  defaultLocale: 'en',

  // When `true`, the default locale is not prefixed with a locale prefix
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(vi|fr)/:path*']
};