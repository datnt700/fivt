export type Locale = (typeof locales)[number];

export const locales = ['en', 'fr', 'vi'] as const;
export const defaultLocale: Locale = 'en';