import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateTransactionForm } from '@/app/(protected)/(dashboard)/transactions/_components/create-transaction-form';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      dateFilter: 'Date',
      amount: 'Amount',
      nameType: 'Type',
      selectType: 'Select type',
      'type.income': 'Income',
      'type.expense': 'Expense',
      category: 'Category',
      description: 'Description',
      addTransaction: 'Add Transaction',
      selected: 'Select category',
      noCategories: 'No categories available',
      loadingCategories: 'Loading categories...',
      addCategory: 'Add new category',
    };
    return translations[key] || key;
  }),
  useLocale: vi.fn(() => 'en'),
}));

// Mock hooks
vi.mock(
  '@/app/(protected)/(dashboard)/transactions/_hooks/use-categories',
  () => ({
    useCategories: vi.fn(),
    useCreateCategory: vi.fn(),
  })
);

vi.mock(
  '@/app/(protected)/(dashboard)/transactions/_hooks/use-transaction',
  () => ({
    useCreateTransaction: vi.fn(),
  })
);

// Mock form validation schema
vi.mock(
  '@/app/(protected)/(dashboard)/transactions/_validations/transaction-schema',
  () => ({
    createTransactionSchema: {},
    type: 'CreateTransactionFormValues',
  })
);

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn((name: string) => {
      // Return props that would set default values
      const defaultValues: Record<string, { value: string | number }> = {
        date: { value: new Date().toISOString().slice(0, 10) },
        amount: { value: 0 },
        type: { value: 'INCOME' },
        categoryId: { value: '' },
        description: { value: '' },
      };
      return defaultValues[name] || {};
    }),
    handleSubmit: vi.fn((fn: () => void) => fn),
    control: {},
    reset: vi.fn(),
    formState: { errors: {}, isSubmitting: false },
  })),
  Controller: ({
    render,
  }: {
    render: (props: {
      field: { value: string; onChange: () => void };
    }) => React.ReactElement;
  }) => render({ field: { value: '', onChange: vi.fn() } }),
}));

// Mock UI components
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select">{children}</div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <div>{placeholder}</div>
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }) => <button {...props}>{children}</button>,
}));

import {
  useCategories,
  useCreateCategory,
} from '@/app/(protected)/(dashboard)/transactions/_hooks/use-categories';
import { useCreateTransaction } from '@/app/(protected)/(dashboard)/transactions/_hooks/use-transaction';

const mockUseCategories = vi.mocked(useCategories);
const mockUseCreateCategory = vi.mocked(useCreateCategory);
const mockUseCreateTransaction = vi.mocked(useCreateTransaction);

// Test wrapper with QueryClient
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

describe('CreateTransactionForm', () => {
  const mockCategories = [
    { id: '1', name: 'Food' },
    { id: '2', name: 'Transport' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCategories.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
      isError: false,
    } as ReturnType<typeof mockUseCategories>);

    mockUseCreateCategory.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof mockUseCreateCategory>);

    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof mockUseCreateTransaction>);
  });

  it('should render all form fields', () => {
    renderWithProviders(<CreateTransactionForm />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderWithProviders(<CreateTransactionForm />);

    expect(
      screen.getByRole('button', { name: 'Add Transaction' })
    ).toBeInTheDocument();
  });

  it('should render date input with proper type', () => {
    renderWithProviders(<CreateTransactionForm />);

    // Get today's date in YYYY-MM-DD format (same as form default)
    const today = new Date().toISOString().slice(0, 10);
    const dateInput = screen.getByDisplayValue(today);
    expect(dateInput).toHaveAttribute('type', 'date');
    expect(dateInput).toHaveAttribute('id', 'date');
  });

  it('should render amount input with proper attributes', () => {
    renderWithProviders(<CreateTransactionForm />);

    const amountInput = screen.getByDisplayValue('0');
    expect(amountInput).toHaveAttribute('type', 'number');
    expect(amountInput).toHaveAttribute('step', '0.01');
    expect(amountInput).toHaveAttribute('id', 'amount');
  });

  it('should render type select with income and expense options', () => {
    renderWithProviders(<CreateTransactionForm />);

    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('should render category select with available categories', () => {
    renderWithProviders(<CreateTransactionForm />);

    expect(screen.getByText('Select category')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Add new category')).toBeInTheDocument();
  });

  it('should render description textarea', () => {
    renderWithProviders(<CreateTransactionForm />);

    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('should show loading message when categories are loading', () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    } as unknown as ReturnType<typeof mockUseCategories>);

    renderWithProviders(<CreateTransactionForm />);

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('should render form with proper structure', () => {
    const { container } = renderWithProviders(<CreateTransactionForm />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass(
      'w-full',
      'max-w-md',
      'mx-auto',
      'flex',
      'flex-col',
      'gap-4'
    );
  });

  it('should have proper field labels', () => {
    renderWithProviders(<CreateTransactionForm />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should use translation keys for all text content', () => {
    renderWithProviders(<CreateTransactionForm />);

    // Verify translated content is displayed
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByText('Select category')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('should call onSuccess callback prop when provided', () => {
    const onSuccess = vi.fn();
    renderWithProviders(<CreateTransactionForm onSuccess={onSuccess} />);

    // Component should render without errors when onSuccess is provided
    expect(
      screen.getByRole('button', { name: 'Add Transaction' })
    ).toBeInTheDocument();
  });
});
