import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'never',
  pathnames: {
    '/': '/',
    '/pathnames': {
      fr: '/chemins',
      vi: '/duong-dan'
    }
  }
});