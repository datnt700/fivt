//import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

// Can be imported from a shared config
//const locales = ['en', 'vi', 'fr'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  //if (!locales.includes(requestLocale as typeof locales[number])) notFound();

    // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});