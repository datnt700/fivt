'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { NextIntlClientProvider } from 'next-intl';

export default function Providers({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale?: string;
  messages?: Record<string, unknown>;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {locale && messages && (
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      )}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
