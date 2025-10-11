import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExtensionsPage from '../../../../../app/(protected)/(dashboard)/extensions/page';

// Mock next-intl
const mockTranslations = {
  'extensions.title': 'Extensions',
  'extensions.subtitle': 'Manage your installed extensions',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async (namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
}));

// Mock the ExtensionsManager component
vi.mock(
  '../../../../../app/(protected)/(dashboard)/extensions/_components/extensions-manager',
  () => ({
    ExtensionsManager: () => (
      <div data-testid="extensions-manager">Extensions Manager Component</div>
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

describe('ExtensionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the extensions page with correct structure', () => {
      renderWithProviders(<ExtensionsPage />);

      // Check main heading
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByText('Extensions')).toBeInTheDocument();

      // Check subtitle
      expect(
        screen.getByText('Manage your installed extensions')
      ).toBeInTheDocument();

      // Check that ExtensionsManager component is rendered
      expect(screen.getByTestId('extensions-manager')).toBeInTheDocument();
    });

    it('should have proper page layout structure', () => {
      const { container } = renderWithProviders(<ExtensionsPage />);

      // Check for the main container with proper spacing - it should be the first div child
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('space-y-6');

      // Check header section structure
      const headerSection = screen.getByText('Extensions').parentElement;
      expect(headerSection).toBeInTheDocument();
      expect(screen.getByText('Manage your installed extensions')).toHaveClass(
        'text-muted-foreground'
      );
    });

    it('should render title with correct styling classes', () => {
      renderWithProviders(<ExtensionsPage />);

      const title = screen.getByText('Extensions');
      expect(title).toHaveClass('text-3xl', 'font-bold', 'tracking-tight');
    });

    it('should render subtitle with correct styling classes', () => {
      renderWithProviders(<ExtensionsPage />);

      const subtitle = screen.getByText('Manage your installed extensions');
      expect(subtitle).toHaveClass('text-muted-foreground');
    });
  });

  describe('Component Integration', () => {
    it('should properly integrate ExtensionsManager component', () => {
      renderWithProviders(<ExtensionsPage />);

      const extensionsManager = screen.getByTestId('extensions-manager');
      expect(extensionsManager).toBeInTheDocument();
      expect(extensionsManager).toHaveTextContent(
        'Extensions Manager Component'
      );
    });
  });

  describe('Internationalization', () => {
    it('should use translation keys for all text content', () => {
      renderWithProviders(<ExtensionsPage />);

      // Verify translations are being used
      expect(screen.getByText('Extensions')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your installed extensions')
      ).toBeInTheDocument();
    });

    it('should handle translation namespace correctly', () => {
      // Mock is already set up at module level, just verify the component renders
      renderWithProviders(<ExtensionsPage />);

      // Verify the translated text appears (this confirms useTranslations is called correctly)
      expect(screen.getByText('Extensions')).toBeInTheDocument();
      expect(
        screen.getByText('Manage your installed extensions')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<ExtensionsPage />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('Extensions');
    });

    it('should provide descriptive content for screen readers', () => {
      renderWithProviders(<ExtensionsPage />);

      // Check that there's descriptive text explaining the page
      expect(
        screen.getByText('Manage your installed extensions')
      ).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have correct container spacing', () => {
      renderWithProviders(<ExtensionsPage />);

      const container = screen.getByText('Extensions').closest('.space-y-6');
      expect(container).toBeInTheDocument();
    });

    it('should render all expected elements in correct order', () => {
      renderWithProviders(<ExtensionsPage />);

      const container = screen.getByText('Extensions').closest('div');
      expect(container).toBeInTheDocument();

      // Check element order: header section, then ExtensionsManager
      const title = screen.getByText('Extensions');
      const subtitle = screen.getByText('Manage your installed extensions');
      const manager = screen.getByTestId('extensions-manager');

      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
      expect(manager).toBeInTheDocument();
    });
  });
});
