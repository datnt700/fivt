import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExtensionsManager } from '../../../../../../app/(protected)/(dashboard)/extensions/_components/extensions-manager';

// Mock translations
const mockT = vi.fn((key: string) => key);
const mockUseTranslations = vi.fn(() => mockT);

// Mock hooks
const mockUseUserExtensions = vi.fn();
const mockUseServices = vi.fn();
const mockUseExtensionPlans = vi.fn();
const mockUseInstallExtension = vi.fn();
const mockUseUninstallExtension = vi.fn();

// Mock the hooks module
vi.mock(
  '../../../../../../app/(protected)/(dashboard)/extensions/_hooks/use-extensions',
  () => ({
    useUserSubscriptions: () => mockUseUserExtensions(),
    useServices: () => mockUseServices(),
    useSubscriptionPlans: () => mockUseExtensionPlans(),
    useSubscribeToService: () => mockUseInstallExtension(),
    useUnsubscribeFromService: () => mockUseUninstallExtension(),
  })
);

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => mockUseTranslations(),
}));

// Mock Next.js router
const mockPush = vi.fn();
const mockBack = vi.fn();
const mockRouter = {
  push: mockPush,
  back: mockBack,
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

interface MockComponentProps {
  children?: React.ReactNode;
  onClick?: () => void;
  [key: string]: unknown;
}

// Mock UI components
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="tabs" {...props}>
      {children}
    </div>
  ),
  TabsContent: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="tabs-content" {...props}>
      {children}
    </div>
  ),
  TabsList: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="tabs-list" {...props}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, ...props }: MockComponentProps) => (
    <button data-testid="tabs-trigger" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card-description" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: MockComponentProps) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: MockComponentProps) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: MockComponentProps) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

describe('ExtensionsManager', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Component Rendering', () => {
    it('renders the extensions manager without crashing', () => {
      // Mock default return values
      mockUseUserExtensions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      const { container } = renderWithProviders(<ExtensionsManager />);

      expect(container).toBeInTheDocument();
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
      expect(screen.getAllByTestId('tabs-trigger')).toHaveLength(2);
    });

    it('handles loading state without crashing', () => {
      mockUseUserExtensions.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      const { container } = renderWithProviders(<ExtensionsManager />);

      expect(container).toBeInTheDocument();
    });

    it('handles error state without crashing', () => {
      const mockError = new Error('Test error');
      mockUseUserExtensions.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      });
      mockUseServices.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      const { container } = renderWithProviders(<ExtensionsManager />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Extensions Data', () => {
    it('renders with user extensions data without crashing', () => {
      const mockExtensions = [
        {
          id: 'ext-1',
          userId: 'user-1',
          serviceId: 'service-1',
          status: 'ACTIVE' as const,
          startDate: new Date('2024-01-01'),
          endDate: null,
          autoRenew: true,
          service: {
            id: 'service-1',
            name: 'Budget Tracker',
            description: 'Track your budget',
            type: 'BUDGET_TRACKING' as const,
            price: 9.99,
            isActive: true,
            features: ['budgeting', 'tracking'],
          },
        },
      ];

      mockUseUserExtensions.mockReturnValue({
        data: mockExtensions,
        isLoading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      const { container } = renderWithProviders(<ExtensionsManager />);

      expect(container).toBeInTheDocument();
    });

    it('renders with available services data', () => {
      const mockServices = [
        {
          id: 'service-1',
          name: 'Budget Tracker',
          description: 'Track your budget',
          type: 'BUDGET_TRACKING' as const,
          price: 9.99,
          isActive: true,
          features: ['budgeting', 'tracking'],
        },
      ];

      mockUseUserExtensions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: mockServices,
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      const { container } = renderWithProviders(<ExtensionsManager />);

      expect(container).toBeInTheDocument();
      expect(screen.getByText('Budget Tracker')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('renders install buttons for available services', () => {
      const mockServices = [
        {
          id: 'service-1',
          name: 'Budget Tracker',
          description: 'Track your budget',
          type: 'BUDGET_TRACKING' as const,
          price: 9.99,
          isActive: true,
          features: ['budgeting', 'tracking'],
        },
      ];

      mockUseUserExtensions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: mockServices,
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      renderWithProviders(<ExtensionsManager />);

      // Check that buttons are rendered
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('renders uninstall buttons for installed extensions', () => {
      const mockExtensions = [
        {
          id: 'ext-1',
          userId: 'user-1',
          serviceId: 'service-1',
          status: 'ACTIVE' as const,
          startDate: new Date('2024-01-01'),
          endDate: null,
          autoRenew: true,
          service: {
            id: 'service-1',
            name: 'Budget Tracker',
            description: 'Track your budget',
            type: 'BUDGET_TRACKING' as const,
            price: 9.99,
            isActive: true,
            features: ['budgeting', 'tracking'],
          },
        },
      ];

      mockUseUserExtensions.mockReturnValue({
        data: mockExtensions,
        isLoading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      renderWithProviders(<ExtensionsManager />);

      // Check that buttons are rendered
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Internationalization', () => {
    it('uses translation hook and translates content', () => {
      mockUseUserExtensions.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseServices.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseExtensionPlans.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });
      mockUseInstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
      mockUseUninstallExtension.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });

      renderWithProviders(<ExtensionsManager />);

      // Check that useTranslations hook was called
      expect(mockUseTranslations).toHaveBeenCalled();
      // Check that translation function was called (component uses many translation keys)
      expect(mockT).toHaveBeenCalled();
    });
  });
});
