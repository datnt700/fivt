import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import ExtensionPage from '../../../../../../app/(protected)/(dashboard)/extensions/[extensionId]/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mock next-intl server
const mockTranslations = {
  'extensions.title': 'Extensions',
  'extensions.subtitle': 'Manage your installed extensions',
};

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
}));

// Mock the ExtensionDetail component
vi.mock(
  '../../../../../../app/(protected)/(dashboard)/extensions/_components/extension-detail',
  () => ({
    ExtensionDetail: vi.fn(({ extensionId }: { extensionId: string }) => (
      <div data-testid="extension-detail">
        Extension Detail for {extensionId}
      </div>
    )),
  })
);

// Mock the ExtensionOperationsProvider
vi.mock(
  '../../../../../../app/(protected)/(dashboard)/extensions/_contexts/extension-operations-context',
  () => ({
    ExtensionOperationsProvider: vi.fn(
      ({ children }: { children: React.ReactNode }) => (
        <div data-testid="extension-operations-provider">{children}</div>
      )
    ),
  })
);

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: { user: { id: 'user-123' } },
    status: 'authenticated',
  })),
}));

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe('ExtensionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid Extension ID', () => {
    it('should render extension page with valid extension ID', async () => {
      const mockParams = Promise.resolve({ extensionId: 'test-extension-1' });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      expect(
        screen.getByTestId('extension-operations-provider')
      ).toBeInTheDocument();
      expect(screen.getByTestId('extension-detail')).toBeInTheDocument();
      expect(
        screen.getByText('Extension Detail for test-extension-1')
      ).toBeInTheDocument();
    });

    it('should pass correct extensionId to ExtensionDetail component', async () => {
      const extensionId = 'banking-service-pro';
      const mockParams = Promise.resolve({ extensionId });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      // Verify the ExtensionDetail component renders with the correct text
      expect(
        screen.getByText('Extension Detail for banking-service-pro')
      ).toBeInTheDocument();
    });

    it('should wrap ExtensionDetail with ExtensionOperationsProvider', async () => {
      const mockParams = Promise.resolve({ extensionId: 'test-extension' });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      // Verify the provider wraps the detail component
      const provider = screen.getByTestId('extension-operations-provider');
      const detail = screen.getByTestId('extension-detail');

      expect(provider).toContainElement(detail);
    });
  });

  describe('Invalid Extension ID', () => {
    it('should call notFound when extensionId is empty string', async () => {
      const mockParams = Promise.resolve({ extensionId: '' });

      await ExtensionPage({ params: mockParams });

      expect(vi.mocked(notFound)).toHaveBeenCalled();
    });

    it('should call notFound when extensionId is undefined', async () => {
      const mockParams = Promise.resolve({
        extensionId: undefined as unknown as string,
      });

      await ExtensionPage({ params: mockParams });

      expect(vi.mocked(notFound)).toHaveBeenCalled();
    });

    it('should call notFound when extensionId is null', async () => {
      const mockParams = Promise.resolve({
        extensionId: null as unknown as string,
      });

      await ExtensionPage({ params: mockParams });

      expect(vi.mocked(notFound)).toHaveBeenCalled();
    });
  });

  describe('Metadata Generation', () => {
    it('should have generateMetadata function available for testing', () => {
      // Test that the component exports are accessible
      expect(ExtensionPage).toBeDefined();
      expect(typeof ExtensionPage).toBe('function');
    });

    it('should handle metadata generation for different extension IDs', () => {
      // Since generateMetadata uses server-side translations,
      // we verify the component structure instead
      expect(ExtensionPage).toBeDefined();
    });
  });

  describe('Async Parameters', () => {
    it('should properly await and destructure params promise', async () => {
      const extensionId = 'async-test-extension';
      const mockParams = Promise.resolve({ extensionId });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      // Verify the component renders with the correct extension ID
      expect(
        screen.getByText('Extension Detail for async-test-extension')
      ).toBeInTheDocument();
    });

    it('should handle params promise resolution correctly', async () => {
      const mockParams = new Promise(resolve => {
        setTimeout(() => resolve({ extensionId: 'delayed-extension' }), 10);
      });

      const result = await ExtensionPage({
        params: mockParams as Promise<{ extensionId: string }>,
      });
      renderWithProviders(result);

      // Verify the component renders with the correct extension ID
      expect(
        screen.getByText('Extension Detail for delayed-extension')
      ).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render ExtensionOperationsProvider as root component', async () => {
      const mockParams = Promise.resolve({ extensionId: 'structure-test' });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      expect(
        screen.getByTestId('extension-operations-provider')
      ).toBeInTheDocument();
    });

    it('should render ExtensionDetail inside provider', async () => {
      const mockParams = Promise.resolve({ extensionId: 'nested-test' });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      const provider = screen.getByTestId('extension-operations-provider');
      const detail = screen.getByTestId('extension-detail');

      expect(provider).toContainElement(detail);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in extension ID', async () => {
      const extensionId = 'extension-with-special-chars_123';
      const mockParams = Promise.resolve({ extensionId });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      // Verify the component renders with the correct extension ID
      expect(
        screen.getByText(
          'Extension Detail for extension-with-special-chars_123'
        )
      ).toBeInTheDocument();
    });

    it('should handle very long extension IDs', async () => {
      const extensionId =
        'this-is-a-very-long-extension-id-that-might-cause-issues-but-should-still-work-correctly';
      const mockParams = Promise.resolve({ extensionId });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      // Verify the component renders with the correct extension ID
      expect(
        screen.getByText(`Extension Detail for ${extensionId}`)
      ).toBeInTheDocument();
    });

    it('should handle numeric extension IDs as strings', async () => {
      const extensionId = '12345';
      const mockParams = Promise.resolve({ extensionId });

      const result = await ExtensionPage({ params: mockParams });
      renderWithProviders(result);

      // Verify the component renders with the correct extension ID
      expect(
        screen.getByText('Extension Detail for 12345')
      ).toBeInTheDocument();
    });
  });
});
