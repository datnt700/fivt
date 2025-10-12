import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import React from 'react';

/**
 * Creates a QueryClient wrapper for testing with consistent configuration
 * Disables retries and provides a clean QueryClient instance for each test
 */
export const createQueryClientWrapper = () => {
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

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'QueryClientTestWrapper';
  return TestWrapper;
};

/**
 * Creates a QueryClient wrapper that returns both the wrapper and the client instance
 * Useful when you need direct access to the QueryClient for spying or manipulation
 */
export const createQueryClientWrapperWithClient = () => {
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

  const TestWrapperWithClient = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapperWithClient.displayName = 'QueryClientTestWrapperWithClient';

  return {
    wrapper: TestWrapperWithClient,
    queryClient,
  };
};

/**
 * Helper for rendering with QueryClient - compatible with existing renderWithQueryClient usage
 * This provides the same interface as the existing test utility but with common configuration
 */
export function renderWithQueryClient(
  ui: React.ReactNode
): ReturnType<typeof render> {
  const QueryClientWrapper = createQueryClientWrapper();
  return render(ui as React.ReactElement, { wrapper: QueryClientWrapper });
}
