import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ExtensionDetail } from '../../../../../../app/(protected)/(dashboard)/extensions/_components/extension-detail';

// Mock next-intl
const mockTranslations = {
  'extensions.back': 'Back to Extensions',
  'extensions.status.active': 'Active',
  'extensions.actions.uninstall': 'Uninstall',
  'extensions.actions.install': 'Install',
  'extensions.actions.installing': 'Installing...',
  'extensions.actions.uninstalling': 'Uninstalling...',
  'extensions.errors.notFound': 'Extension Not Found',
  'extensions.errors.notFoundDescription':
    'The requested extension could not be found.',
  'extensions.notifications.installSuccess': '{name} installed successfully!',
  'extensions.notifications.installError': 'Failed to install {name}',
  'extensions.notifications.uninstallSuccess':
    '{name} uninstalled successfully!',
  'extensions.notifications.uninstallError': 'Failed to uninstall {name}',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(
    (namespace: string) => (key: string, params?: { name?: string }) => {
      const fullKey = `${namespace}.${key}`;
      let translation =
        mockTranslations[fullKey as keyof typeof mockTranslations] || key;

      if (params && typeof translation === 'string') {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }

      return translation;
    }
  ),
}));

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock sonner toast first (before other imports that might use it)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock hooks
const mockUseServices = vi.fn();
const mockUseUserSubscriptions = vi.fn();
const mockUseSubscribeToService = vi.fn();
const mockUseUnsubscribeFromService = vi.fn();

vi.mock(
  '../../../../../../app/(protected)/(dashboard)/extensions/_hooks/use-extensions',
  () => ({
    useServices: () => mockUseServices(),
    useUserSubscriptions: () => mockUseUserSubscriptions(),
    useSubscribeToService: () => mockUseSubscribeToService(),
    useUnsubscribeFromService: () => mockUseUnsubscribeFromService(),
  })
);

// Mock extension operations context
const mockUseExtensionOperations = vi.fn();

vi.mock(
  '../../../../../../app/(protected)/(dashboard)/extensions/_contexts/extension-operations-context',
  () => ({
    useExtensionOperations: () => mockUseExtensionOperations(),
  })
);

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button
      data-testid="button"
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  Download: () => <svg data-testid="download-icon" />,
  Loader2: () => <svg data-testid="loader2-icon" />,
  Trash2: () => <svg data-testid="trash2-icon" />,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function renderWithProviders(component: React.ReactElement) {
  return render(component, { wrapper: TestWrapper });
}

describe('ExtensionDetail', () => {
  const mockExtension = {
    id: 'test-extension-1',
    name: 'Test Extension',
    description: 'A test extension for testing purposes',
    type: 'DASHBOARD' as const,
    price: 9.99,
    isActive: true,
  };

  const mockSubscription = {
    id: 'sub-1',
    userId: 'user-1',
    serviceId: 'test-extension-1',
    status: 'ACTIVE' as const,
    startDate: new Date(),
    endDate: null,
    autoRenew: true,
    service: mockExtension,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    mockUseExtensionOperations.mockReturnValue({
      isInstalling: vi.fn(() => false),
      isUninstalling: vi.fn(() => false),
      setInstallingServiceId: vi.fn(),
      setUninstallingServiceId: vi.fn(),
    });

    mockUseSubscribeToService.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    mockUseUnsubscribeFromService.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  describe('Loading State', () => {
    it('should show loading state when services are loading', () => {
      mockUseServices.mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Back to Extensions')).toBeInTheDocument();
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should show loading state when subscriptions are loading', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Back to Extensions')).toBeInTheDocument();
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  describe('Extension Not Found', () => {
    it('should show not found message when extension does not exist', () => {
      mockUseServices.mockReturnValue({
        data: [],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="non-existent" />);

      expect(screen.getByText('Extension Not Found')).toBeInTheDocument();
      expect(
        screen.getByText('The requested extension could not be found.')
      ).toBeInTheDocument();
    });
  });

  describe('Extension Details Display', () => {
    it('should display extension details when loaded', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Test Extension')).toBeInTheDocument();
      expect(
        screen.getByText('A test extension for testing purposes')
      ).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument(); // Dashboard icon
    });

    it('should show active badge when extension is installed', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [mockSubscription],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  describe('Installation Actions', () => {
    it('should show install button when extension is not installed', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Install')).toBeInTheDocument();
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    it('should show uninstall button when extension is installed', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [mockSubscription],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Uninstall')).toBeInTheDocument();
      expect(screen.getByTestId('trash2-icon')).toBeInTheDocument();
    });

    it('should handle install action', async () => {
      const mockMutate = vi.fn();
      mockUseSubscribeToService.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      const mockSetInstallingServiceId = vi.fn();
      mockUseExtensionOperations.mockReturnValue({
        isInstalling: vi.fn(() => false),
        isUninstalling: vi.fn(() => false),
        setInstallingServiceId: mockSetInstallingServiceId,
        setUninstallingServiceId: vi.fn(),
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      const installButton = screen.getByText('Install');
      fireEvent.click(installButton);

      expect(mockSetInstallingServiceId).toHaveBeenCalledWith(
        'test-extension-1'
      );
      expect(mockMutate).toHaveBeenCalledWith(
        { serviceId: 'test-extension-1' },
        expect.any(Object)
      );
    });

    it('should handle uninstall action', async () => {
      const mockMutate = vi.fn();
      mockUseUnsubscribeFromService.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [mockSubscription],
        isLoading: false,
      });

      const mockSetUninstallingServiceId = vi.fn();
      mockUseExtensionOperations.mockReturnValue({
        isInstalling: vi.fn(() => false),
        isUninstalling: vi.fn(() => false),
        setInstallingServiceId: vi.fn(),
        setUninstallingServiceId: mockSetUninstallingServiceId,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      const uninstallButton = screen.getByText('Uninstall');
      fireEvent.click(uninstallButton);

      expect(mockSetUninstallingServiceId).toHaveBeenCalledWith(
        'test-extension-1'
      );
      expect(mockMutate).toHaveBeenCalledWith(
        'test-extension-1',
        expect.any(Object)
      );
    });
  });

  describe('Loading States for Actions', () => {
    it('should show installing state', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      mockUseExtensionOperations.mockReturnValue({
        isInstalling: vi.fn(id => id === 'test-extension-1'),
        isUninstalling: vi.fn(() => false),
        setInstallingServiceId: vi.fn(),
        setUninstallingServiceId: vi.fn(),
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Installing...')).toBeInTheDocument();
      expect(screen.getByTestId('loader2-icon')).toBeInTheDocument();
    });

    it('should show uninstalling state', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [mockSubscription],
        isLoading: false,
      });

      mockUseExtensionOperations.mockReturnValue({
        isInstalling: vi.fn(() => false),
        isUninstalling: vi.fn(id => id === 'test-extension-1'),
        setInstallingServiceId: vi.fn(),
        setUninstallingServiceId: vi.fn(),
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('Uninstalling...')).toBeInTheDocument();
      expect(screen.getByTestId('loader2-icon')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should handle back button click', () => {
      mockUseServices.mockReturnValue({
        data: [mockExtension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      const backButton = screen.getByText('Back to Extensions');
      fireEvent.click(backButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  describe('Service Icons', () => {
    it('should display correct icon for different service types', () => {
      const serviceTypes = [
        { type: 'DASHBOARD', icon: '📊' },
        { type: 'BUDGET_TRACKING', icon: '💰' },
        { type: 'TRANSACTION_MANAGEMENT', icon: '💳' },
        { type: 'BANKING_INTEGRATION', icon: '🏦' },
        { type: 'AI_CHATBOT', icon: '🤖' },
      ];

      serviceTypes.forEach(({ type, icon }) => {
        const extension = {
          ...mockExtension,
          type: type as unknown as typeof mockExtension.type,
        };

        mockUseServices.mockReturnValue({
          data: [extension],
          isLoading: false,
        });
        mockUseUserSubscriptions.mockReturnValue({
          data: [],
          isLoading: false,
        });

        const { unmount } = renderWithProviders(
          <ExtensionDetail extensionId="test-extension-1" />
        );

        expect(screen.getByText(icon)).toBeInTheDocument();

        unmount();
      });
    });

    it('should display default icon for unknown service type', () => {
      const extension = {
        ...mockExtension,
        type: 'UNKNOWN_TYPE' as unknown as typeof mockExtension.type,
      };

      mockUseServices.mockReturnValue({
        data: [extension],
        isLoading: false,
      });
      mockUseUserSubscriptions.mockReturnValue({
        data: [],
        isLoading: false,
      });

      renderWithProviders(<ExtensionDetail extensionId="test-extension-1" />);

      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });
  });
});
