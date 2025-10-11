import clsx from 'clsx';
import { Inter } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={clsx('mdl-js h-full', inter.className)}
      suppressHydrationWarning
    >
      <head />
      <body className="h-full overflow-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="h-full">{children}</div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
