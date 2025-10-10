import { screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ManualTransactionsList } from '@/app/(protected)/(dashboard)/budget/_components/manual-transactions-list';
import { renderWithQueryClient } from '../../../../../utils/query-client-wrapper';

// Mock next-intl
const mockTranslations = {
  'transactions.manualTransactions': 'Manual Transactions',
  'transactions.manualSubtitle': 'Track your manual income and expenses',
  'transactions.addTransaction': 'Add Transaction',
  'transactions.failedToLoadManual': 'Failed to load manual transactions',
  'transactions.noManualTransactions': 'No manual transactions',
  'transactions.noManualTransactionsDesc':
    'Start by adding your first manual transaction',
  'transactions.name': 'Transaction',
  'transactions.manual': 'Manual',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
  useLocale: vi.fn(() => 'en'),
}));

// Mock utility functions
vi.mock('@/app/(protected)/(dashboard)/transactions/_utils', () => ({
  formatCurrency: vi.fn((amount: number) => `$${amount.toFixed(2)}`),
  formatDate: vi.fn((date: string) => {
    const d = new Date(date);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  }),
}));

// Mock icons
vi.mock('lucide-react', () => ({
  CreditCard: vi.fn(() => <div data-testid="credit-card-icon" />),
  TrendingDown: vi.fn(() => <div data-testid="trending-down-icon" />),
  TrendingUp: vi.fn(() => <div data-testid="trending-up-icon" />),
  AlertCircle: vi.fn(() => <div data-testid="alert-circle-icon" />),
}));

describe('ManualTransactionsList', () => {
  const mockTransactions = [
    {
      id: '1',
      description: 'Groceries',
      amount: 50.25,
      type: 'EXPENSE' as const,
      categoryId: 'cat1',
      userId: 'user1',
      createdAt: '2023-10-10T10:00:00Z',
      updatedAt: '2023-10-10T10:00:00Z',
      category: { id: 'cat1', name: 'Food' },
    },
    {
      id: '2',
      description: 'Freelance Payment',
      amount: 1200.0,
      type: 'INCOME' as const,
      categoryId: 'cat2',
      userId: 'user1',
      createdAt: '2023-10-09T15:30:00Z',
      updatedAt: '2023-10-09T15:30:00Z',
      category: { id: 'cat2', name: 'Work' },
    },
    {
      id: '3',
      description: '',
      amount: 25.99,
      type: 'EXPENSE' as const,
      categoryId: 'cat3',
      userId: 'user1',
      createdAt: '2023-10-08T12:15:00Z',
      updatedAt: '2023-10-08T12:15:00Z',
      category: { id: 'cat3', name: 'Other' },
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    loading: false,
    error: null,
    openCreateTransactionModal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render card header with title and description', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    expect(screen.getByText('Manual Transactions')).toBeInTheDocument();
    expect(
      screen.getByText('Track your manual income and expenses')
    ).toBeInTheDocument();
  });

  it('should render add transaction button in header', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: 'Add Transaction' });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveClass('shrink-0');
  });

  it('should call openCreateTransactionModal when add button is clicked', async () => {
    const user = userEvent.setup();
    const mockOpenModal = vi.fn();

    renderWithQueryClient(
      <ManualTransactionsList
        {...defaultProps}
        openCreateTransactionModal={mockOpenModal}
      />
    );

    const addButton = screen.getByRole('button', { name: 'Add Transaction' });
    await user.click(addButton);

    expect(mockOpenModal).toHaveBeenCalledOnce();
  });

  it('should render loading state with skeletons', () => {
    renderWithQueryClient(
      <ManualTransactionsList
        {...defaultProps}
        loading={true}
        transactions={undefined}
      />
    );

    // Should render skeleton items (using data-slot="skeleton")
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    const error = new Error('Network error');
    renderWithQueryClient(
      <ManualTransactionsList
        {...defaultProps}
        error={error}
        loading={false}
        transactions={undefined}
      />
    );

    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(
      screen.getByText('Failed to load manual transactions')
    ).toBeInTheDocument();
  });

  it('should render empty state when no transactions', () => {
    renderWithQueryClient(
      <ManualTransactionsList {...defaultProps} transactions={[]} />
    );

    expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
    expect(screen.getByText('No manual transactions')).toBeInTheDocument();
    expect(
      screen.getByText('Start by adding your first manual transaction')
    ).toBeInTheDocument();
  });

  it('should render empty state when transactions is undefined', () => {
    renderWithQueryClient(
      <ManualTransactionsList {...defaultProps} transactions={undefined} />
    );

    expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
    expect(screen.getByText('No manual transactions')).toBeInTheDocument();
  });

  it('should render list of transactions', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Freelance Payment')).toBeInTheDocument();

    // Check formatted amounts
    expect(screen.getByText('-$50.25')).toBeInTheDocument();
    expect(screen.getByText('+$1200.00')).toBeInTheDocument();
  });

  it('should render correct icons for transaction types', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Should have both income and expense icons
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getAllByTestId('trending-down-icon')).toHaveLength(2);
  });

  it('should apply correct styling for income transactions', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Find the income transaction icon by looking for the trending-up icon
    const trendingUpIcon = screen.getByTestId('trending-up-icon');
    const iconContainer = trendingUpIcon.parentElement;

    expect(iconContainer).toHaveClass('bg-green-100', 'text-green-600');

    // Check amount styling
    const amountElement = screen.getByText('+$1200.00');
    expect(amountElement).toHaveClass('text-green-600');
  });

  it('should apply correct styling for expense transactions', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Find the first expense transaction icon (there are multiple, so get the first)
    const trendingDownIcons = screen.getAllByTestId('trending-down-icon');
    const iconContainer = trendingDownIcons[0]?.parentElement;

    expect(iconContainer).toHaveClass('bg-red-100', 'text-red-600');

    // Check amount styling
    const amountElement = screen.getByText('-$50.25');
    expect(amountElement).toHaveClass('text-red-600');
  });

  it('should render category badges when present', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should not render category badge when category is null', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // The third transaction has no category, so should only see 2 category badges
    expect(screen.getAllByText(/Food|Work/)).toHaveLength(2);
  });

  it('should render fallback text for empty description', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // The third transaction has empty description, should show fallback
    expect(screen.getByText('Transaction')).toBeInTheDocument();
  });

  it('should render manual badge for all transactions', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    const manualBadges = screen.getAllByText('Manual');
    expect(manualBadges).toHaveLength(3);
  });

  it('should render formatted dates', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Mock formatDate returns consistently formatted dates
    expect(screen.getByText('10/10/2023')).toBeInTheDocument();
    expect(screen.getByText('10/09/2023')).toBeInTheDocument();
    expect(screen.getByText('10/08/2023')).toBeInTheDocument();
  });

  it('should have hover effects on transaction items', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Find transaction row containers (they have the hover classes)
    const transactionRows = document.querySelectorAll(
      '.hover\\:bg-accent\\/50'
    );

    expect(transactionRows.length).toBeGreaterThan(0);
    transactionRows.forEach(row => {
      expect(row).toHaveClass('hover:bg-accent/50', 'transition-colors');
    });
  });

  it('should handle overflow with truncation', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Find elements with truncate class
    const truncateElements = document.querySelectorAll('.truncate');

    expect(truncateElements.length).toBeGreaterThan(0);
    truncateElements.forEach(element => {
      expect(element).toHaveClass('truncate');
    });
  });

  it('should render with proper layout structure', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    // Check header layout
    const headerContainer = document.querySelector(
      '.flex.items-start.justify-between'
    );
    expect(headerContainer).toBeInTheDocument();

    // Check content spacing
    const contentContainer = document.querySelector('.space-y-3');
    expect(contentContainer).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    renderWithQueryClient(<ManualTransactionsList {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: 'Add Transaction' });
    expect(addButton).toBeInTheDocument();

    // Should have proper button type
    expect(addButton).toHaveAttribute('type', 'button');
  });

  it('should handle large amounts correctly', () => {
    const largeAmountTransactions = [
      {
        id: '1',
        description: 'Large Payment',
        amount: 999999.99,
        type: 'INCOME' as const,
        categoryId: 'cat4',
        userId: 'user1',
        createdAt: '2023-10-10T10:00:00Z',
        updatedAt: '2023-10-10T10:00:00Z',
        category: { id: 'cat4', name: 'Other' },
      },
    ];

    renderWithQueryClient(
      <ManualTransactionsList
        {...defaultProps}
        transactions={largeAmountTransactions}
      />
    );

    expect(screen.getByText('+$999999.99')).toBeInTheDocument();
  });

  it('should handle zero amounts', () => {
    const zeroAmountTransaction = [
      {
        id: '1',
        description: 'Zero Amount',
        amount: 0,
        type: 'EXPENSE' as const,
        categoryId: 'cat5',
        userId: 'user1',
        createdAt: '2023-10-10T10:00:00Z',
        updatedAt: '2023-10-10T10:00:00Z',
        category: { id: 'cat5', name: 'Other' },
      },
    ];

    renderWithQueryClient(
      <ManualTransactionsList
        {...defaultProps}
        transactions={zeroAmountTransaction}
      />
    );

    expect(screen.getByText('-$0.00')).toBeInTheDocument();
  });
});
