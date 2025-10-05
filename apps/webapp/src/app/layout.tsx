import clsx from 'clsx';
import { Inter } from 'next/font/google';
import { getLocale, getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import Providers from './providers';
import '@/app/globals.css';

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
      className={clsx('mdl-js', inter.className)}
      suppressHydrationWarning
    >
      <head />
      <body>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
