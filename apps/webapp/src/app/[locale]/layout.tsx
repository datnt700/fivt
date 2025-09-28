// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const locales = ['en', 'vi', 'fr'] as const;
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleRootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: 'en' | 'vi' | 'fr' };
}) {
  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
