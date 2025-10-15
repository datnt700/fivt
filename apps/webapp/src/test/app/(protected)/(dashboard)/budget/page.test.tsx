import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import BudgetPage from '@/app/(protected)/(dashboard)/budget/page';
import { renderWithQueryClient } from '../../../../utils/query-client-wrapper';
import { useTransactions } from '@/app/(protected)/(dashboard)/budget/_hooks/use-transaction';

// Mock next-intl
const mockTranslations = {
  'budget.title': 'Budget Tracking',
  'budget.subtitle': 'Track your manual income and expenses',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
  useLocale: vi.fn(() => 'en'),
}));

// Mock the transaction hook
vi.mock('@/app/(protected)/(dashboard)/budget/_hooks/use-transaction', () => ({
  useTransactions: vi.fn(),
}));

// Mock ServiceGuard component
vi.mock('@/components/subscription/service-guard', () => ({
  ServiceGuard: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock components
vi.mock('@/app/(protected)/(dashboard)/transactions/_components', () => ({
  ManualTransactionsList: vi.fn(
    ({
      transactions,
      loading,
      error,
      openCreateTransactionModal,
    }: {
      transactions:
        | Array<{
            id: string;
            description: string;
            amount: number;
            type: string;
          }>
        | undefined;
      loading: boolean;
      error: Error | null;
      openCreateTransactionModal: () => void;
    }) => (
      <div data-testid="manual-transactions-list">
        {loading && <div data-testid="loading">Loading...</div>}
        {error && <div data-testid="error">Error: {error.message}</div>}
        {transactions && transactions.length > 0 && (
          <div data-testid="transactions">
            {transactions.map((tx, index) => (
              <div key={index} data-testid={`transaction-${index}`}>
                {tx.description} - {tx.amount}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={openCreateTransactionModal}
          data-testid="open-modal-button"
        >
          Add Transaction
        </button>
      </div>
    )
  ),
}));

vi.mock(
  '@/app/(protected)/(dashboard)/budget/_components/create-transaction-modal',
  () => ({
    CreateTransactionModal: vi.fn(
      ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
          <div data-testid="create-transaction-modal">
            <h2>Add Transaction</h2>
            <button onClick={onClose} data-testid="close-modal-button">
              Close
            </button>
          </div>
        ) : null
    ),
  })
);

describe('BudgetPage', () => {
  const mockTransactions = [
    { id: '1', description: 'Groceries', amount: 50.0, type: 'EXPENSE' },
    { id: '2', description: 'Salary', amount: 2000.0, type: 'INCOME' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTransactions>);
  });

  it('should render page title and subtitle', () => {
    renderWithQueryClient(<BudgetPage />);

    expect(screen.getByText('Budget Tracking')).toBeInTheDocument();
    expect(
      screen.getByText('Track your manual income and expenses')
    ).toBeInTheDocument();
  });

  it('should render manual transactions list component', () => {
    renderWithQueryClient(<BudgetPage />);

    expect(screen.getByTestId('manual-transactions-list')).toBeInTheDocument();
  });

  it('should pass correct props to ManualTransactionsList', () => {
    renderWithQueryClient(<BudgetPage />);

    // Check that transactions are passed
    expect(screen.getByTestId('transactions')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-0')).toHaveTextContent(
      'Groceries - 50'
    );
    expect(screen.getByTestId('transaction-1')).toHaveTextContent(
      'Salary - 2000'
    );
  });

  it('should handle loading state', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useTransactions>);

    renderWithQueryClient(<BudgetPage />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const error = new Error('Failed to load transactions');
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as ReturnType<typeof useTransactions>);

    renderWithQueryClient(<BudgetPage />);

    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(
      screen.getByText('Error: Failed to load transactions')
    ).toBeInTheDocument();
  });

  it('should initially render modal as closed', () => {
    renderWithQueryClient(<BudgetPage />);

    expect(
      screen.queryByTestId('create-transaction-modal')
    ).not.toBeInTheDocument();
  });

  it('should open modal when openCreateTransactionModal is called', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BudgetPage />);

    const openButton = screen.getByTestId('open-modal-button');
    await user.click(openButton);

    expect(screen.getByTestId('create-transaction-modal')).toBeInTheDocument();
    // Check for the modal heading instead of the button text to avoid ambiguity
    expect(screen.getByTestId('create-transaction-modal')).toHaveTextContent(
      'Add Transaction'
    );
  });

  it('should close modal when onClose is called', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<BudgetPage />);

    // Open modal
    const openButton = screen.getByTestId('open-modal-button');
    await user.click(openButton);

    expect(screen.getByTestId('create-transaction-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId('close-modal-button');
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId('create-transaction-modal')
      ).not.toBeInTheDocument();
    });
  });

  it('should have proper layout structure', () => {
    renderWithQueryClient(<BudgetPage />);

    // Check that the page renders with the expected structure
    expect(screen.getByText('Budget Tracking')).toBeInTheDocument();
    expect(
      screen.getByText('Track your manual income and expenses')
    ).toBeInTheDocument();

    // Check header section
    expect(screen.getByText('Budget Tracking')).toHaveClass(
      'text-3xl',
      'font-bold',
      'tracking-tight'
    );
    expect(
      screen.getByText('Track your manual income and expenses')
    ).toHaveClass('text-muted-foreground');
  });

  it('should handle empty transactions array', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTransactions>);

    renderWithQueryClient(<BudgetPage />);

    expect(screen.getByTestId('manual-transactions-list')).toBeInTheDocument();
    expect(screen.queryByTestId('transactions')).not.toBeInTheDocument();
  });

  it('should handle undefined transactions data', () => {
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTransactions>);

    renderWithQueryClient(<BudgetPage />);

    expect(screen.getByTestId('manual-transactions-list')).toBeInTheDocument();
    expect(screen.queryByTestId('transactions')).not.toBeInTheDocument();
  });

  it('should maintain modal state independently of data loading', async () => {
    const user = userEvent.setup();

    // Start with loading state
    vi.mocked(useTransactions).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useTransactions>);

    const { rerender } = renderWithQueryClient(<BudgetPage />);

    // Open modal while loading
    const openButton = screen.getByTestId('open-modal-button');
    await user.click(openButton);

    expect(screen.getByTestId('create-transaction-modal')).toBeInTheDocument();

    // Update data to loaded state
    vi.mocked(useTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useTransactions>);

    rerender(<BudgetPage />);

    // Modal should still be open
    expect(screen.getByTestId('create-transaction-modal')).toBeInTheDocument();
  });
});
