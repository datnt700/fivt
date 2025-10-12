'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { FinancialProfileProvider } from '@/contexts/financial-profile-context';

export default function ClientProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <FinancialProfileProvider>
          {children}
        </FinancialProfileProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}