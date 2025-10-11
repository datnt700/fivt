import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderResult } from '@testing-library/react';
import { ReactNode } from 'react';

export function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function QueryClientWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// Helper for rendering with QueryClient
export function renderWithQueryClient(ui: ReactNode): RenderResult {
  const QueryClientWrapper = createQueryClientWrapper();
  return render(ui as React.ReactElement, { wrapper: QueryClientWrapper });
}
