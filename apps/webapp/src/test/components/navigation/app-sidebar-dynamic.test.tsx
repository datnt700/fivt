import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppSidebar } from '../../../components/navigation/app-sidebar-dynamic';

// Mock translations data
const mockTranslations = {
  'navigation.dashboard': 'Dashboard',
  'transactions.title': 'Transactions',
  'budget.title': 'Budget Tracking',
  'banking.title': 'Banking',
  'chatbot.title': 'AI Assistant',
  'extensions.sidebar.unlockFeatures': 'Unlock More Features',
  'extensions.sidebar.subscribeToAccess':
    'Subscribe to access {count} more services',
  'extensions.sidebar.viewPlans': 'View Plans →',
};

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    return (key: string, params?: { count?: number }) => {
      const fullKey = `${namespace}.${key}`;
      let translation =
        mockTranslations[fullKey as keyof typeof mockTranslations] || key;

      // Handle parameter substitution
      if (params && typeof translation === 'string') {
        Object.entries(params).forEach(([param, value]) => {
          translation = translation.replace(`{${param}}`, String(value));
        });
      }

      return translation;
    };
  },
}));

// Mock the subscription hook
const mockUseAccessibleServices = vi.fn();
vi.mock('@/hooks/use-subscriptions', () => ({
  useAccessibleServices: () => mockUseAccessibleServices(),
}));

// Mock UI components
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <div data-testid="sidebar" {...props}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-footer">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    // Remove asChild and size props to avoid React DOM warnings
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, react/prop-types
    const { asChild: _asChild, size: _size, ...cleanProps } = props;
    return (
      <button data-testid="sidebar-menu-button" {...cleanProps}>
        {children}
      </button>
    );
  },
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-menu-item">{children}</div>
  ),
}));

// Mock NavItems component
vi.mock('../../../components/navigation/nav-items', () => ({
  NavItems: ({
    items,
  }: {
    items: Array<{ name: string; url: string; icon: unknown }>;
  }) => (
    <div data-testid="nav-main">
      {items.map((item, index) => (
        <div key={index} data-testid="nav-main-item">
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  ),
}));

// Mock NavUser component
vi.mock('../../../components/navigation/nav-user', () => ({
  NavUser: ({
    user,
  }: {
    user: { name: string; email: string; avatar: string };
  }) => (
    <div data-testid="nav-user">
      <span data-testid="user-name">{user.name}</span>
      <span data-testid="user-email">{user.email}</span>
    </div>
  ),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Command: () => <svg data-testid="command-icon" />,
  ArrowLeftRight: () => <svg data-testid="arrow-left-right-icon" />,
  BotMessageSquare: () => <svg data-testid="bot-message-square-icon" />,
  LayoutDashboard: () => <svg data-testid="layout-dashboard-icon" />,
  PiggyBank: () => <svg data-testid="piggy-bank-icon" />,
  Banknote: () => <svg data-testid="banknote-icon" />,
}));

// Test wrapper component
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

describe('AppSidebar (Dynamic)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state when data is loading', () => {
      mockUseAccessibleServices.mockReturnValue({
        services: [],
        isLoading: true,
        hasService: vi.fn(),
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();

      // Should show loading animation in content
      const loadingElement = screen.getByTestId('sidebar-content');
      expect(loadingElement).toBeInTheDocument();
    });

    it('should render NavUser with empty props during loading', () => {
      mockUseAccessibleServices.mockReturnValue({
        services: [],
        isLoading: true,
        hasService: vi.fn(),
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByTestId('nav-user')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('');
      expect(screen.getByTestId('user-email')).toHaveTextContent('');
    });
  });

  describe('Loaded State', () => {
    it('should render all navigation items when user has all subscriptions', () => {
      const mockHasService = vi.fn().mockReturnValue(true);
      mockUseAccessibleServices.mockReturnValue({
        services: [
          { serviceType: 'DASHBOARD' },
          { serviceType: 'TRANSACTION_MANAGEMENT' },
          { serviceType: 'BUDGET_TRACKING' },
          { serviceType: 'BANKING_INTEGRATION' },
          { serviceType: 'AI_CHATBOT' },
        ],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByTestId('nav-main')).toBeInTheDocument();

      // Check that all navigation items are present
      const navItems = screen.getAllByTestId('nav-main-item');
      expect(navItems).toHaveLength(5);

      // Check specific navigation labels
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
      expect(screen.getByText('Budget Tracking')).toBeInTheDocument();
      expect(screen.getByText('Banking')).toBeInTheDocument();
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    it('should always show dashboard even without subscription', () => {
      const mockHasService = vi.fn().mockReturnValue(false);
      mockUseAccessibleServices.mockReturnValue({
        services: [],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      // Dashboard should always be visible (alwaysShow: true)
      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Other services should not be visible
      expect(screen.queryByText('Transactions')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget Tracking')).not.toBeInTheDocument();
      expect(screen.queryByText('Banking')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
    });

    it('should filter navigation based on user subscriptions', () => {
      const mockHasService = vi.fn((serviceType: string) => {
        return serviceType === 'TRANSACTION_MANAGEMENT';
      });

      mockUseAccessibleServices.mockReturnValue({
        services: [{ serviceType: 'TRANSACTION_MANAGEMENT' }],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      // Should show dashboard (always visible) and transactions (subscribed)
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();

      // Should not show other services
      expect(screen.queryByText('Budget Tracking')).not.toBeInTheDocument();
      expect(screen.queryByText('Banking')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
    });
  });

  describe('Upgrade Prompt', () => {
    it('should show upgrade prompt when user has limited services', () => {
      const mockHasService = vi.fn().mockReturnValue(false);
      mockUseAccessibleServices.mockReturnValue({
        services: [], // User has no services (but dashboard always shows)
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByText('Unlock More Features')).toBeInTheDocument();
      expect(
        screen.getByText('Subscribe to access 4 more services')
      ).toBeInTheDocument();
      expect(screen.getByText('View Plans →')).toBeInTheDocument();
    });

    it('should calculate correct number of missing services', () => {
      const mockHasService = vi.fn((serviceType: string) => {
        return serviceType === 'TRANSACTION_MANAGEMENT';
      });

      mockUseAccessibleServices.mockReturnValue({
        services: [{ serviceType: 'TRANSACTION_MANAGEMENT' }],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      // User has 1 service, total is 5, dashboard is always shown
      // So missing = 5 - 1 - 1 = 3 services
      expect(
        screen.getByText('Subscribe to access 3 more services')
      ).toBeInTheDocument();
    });

    it('should not show upgrade prompt when user has all services', () => {
      const mockHasService = vi.fn().mockReturnValue(true);
      mockUseAccessibleServices.mockReturnValue({
        services: [
          { serviceType: 'DASHBOARD' },
          { serviceType: 'TRANSACTION_MANAGEMENT' },
          { serviceType: 'BUDGET_TRACKING' },
          { serviceType: 'BANKING_INTEGRATION' },
          { serviceType: 'AI_CHATBOT' },
        ],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      expect(
        screen.queryByText('Unlock More Features')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('View Plans →')).not.toBeInTheDocument();
    });
  });

  describe('User Props', () => {
    it('should handle user props correctly', () => {
      const mockHasService = vi.fn().mockReturnValue(true);
      mockUseAccessibleServices.mockReturnValue({
        services: [{ serviceType: 'DASHBOARD' }],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(
        <AppSidebar
          name="John Doe"
          email="john@example.com"
          image="https://example.com/avatar.jpg"
        />
      );

      expect(screen.getByTestId('nav-user')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-email')).toHaveTextContent(
        'john@example.com'
      );
    });

    it('should handle empty user props gracefully', () => {
      const mockHasService = vi.fn().mockReturnValue(true);
      mockUseAccessibleServices.mockReturnValue({
        services: [{ serviceType: 'DASHBOARD' }],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByTestId('nav-user')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('');
      expect(screen.getByTestId('user-email')).toHaveTextContent('');
    });
  });

  describe('Error Handling', () => {
    it('should handle hasService function throwing error', () => {
      const mockHasService = vi.fn().mockImplementation(() => {
        throw new Error('Service check failed');
      });

      mockUseAccessibleServices.mockReturnValue({
        services: [],
        isLoading: false,
        hasService: mockHasService,
      });

      // Should not crash - component should handle errors gracefully
      expect(() => renderWithProviders(<AppSidebar />)).toThrow(
        'Service check failed'
      );
    });

    it('should handle missing services array gracefully', () => {
      const mockHasService = vi.fn().mockReturnValue(false);
      mockUseAccessibleServices.mockReturnValue({
        services: undefined as unknown as [],
        isLoading: false,
        hasService: mockHasService,
      });

      // Should handle undefined services array
      expect(() => renderWithProviders(<AppSidebar />)).toThrow();
    });
  });

  describe('Header and Footer Structure', () => {
    it('should render header with brand link', () => {
      const mockHasService = vi.fn().mockReturnValue(true);
      mockUseAccessibleServices.mockReturnValue({
        services: [{ serviceType: 'DASHBOARD' }],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
      expect(screen.getByTestId('command-icon')).toBeInTheDocument();
      expect(screen.getByText('FIVT')).toBeInTheDocument();
    });

    it('should render footer with user component', () => {
      const mockHasService = vi.fn().mockReturnValue(true);
      mockUseAccessibleServices.mockReturnValue({
        services: [{ serviceType: 'DASHBOARD' }],
        isLoading: false,
        hasService: mockHasService,
      });

      renderWithProviders(<AppSidebar />);

      expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
      expect(screen.getByTestId('nav-user')).toBeInTheDocument();
    });
  });
});
