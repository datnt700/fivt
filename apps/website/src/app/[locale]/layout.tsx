import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Chỉ check locale ở đây (không phải root layout)
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  // Lấy messages ổn định theo locale
  const messages = await getMessages({ locale }); // hoặc getMessages() nếu bạn đã config middleware

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
