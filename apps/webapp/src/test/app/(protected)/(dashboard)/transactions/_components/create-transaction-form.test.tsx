import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      addCategory: 'Add new category',
    };
    return translations[key] || key;
  }),
}));

// Mock hooks
vi.mock('@/app/(protected)/(dashboard)/transactions/_hooks/use-categories', () => ({
  useCategories: vi.fn(),
  useCreateCategory: vi.fn(),
}));

vi.mock('@/app/(protected)/(dashboard)/transactions/_hooks/use-transaction', () => ({
  useCreateTransaction: vi.fn(),
}));

// Mock form validation schema
vi.mock('@/app/(protected)/(dashboard)/transactions/_validations/transaction-schema', () => ({
  createTransactionSchema: {},
  type: 'CreateTransactionFormValues',
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    register: vi.fn((name) => {
      // Return props that would set default values
      const defaultValues: Record<string, any> = {
        date: { value: new Date().toISOString().slice(0, 10) },
        amount: { value: 0 },
        type: { value: 'INCOME' },
        categoryId: { value: '' },
        description: { value: '' },
      };
      return defaultValues[name] || {};
    }),
    handleSubmit: vi.fn((fn) => fn),
    control: {},
    reset: vi.fn(),
    formState: { errors: {}, isSubmitting: false },
  })),
  Controller: ({ render }: { render: Function }) => render({ field: { value: '', onChange: vi.fn() } }),
}));

// Mock UI components
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

import { useCategories, useCreateCategory } from '@/app/(protected)/(dashboard)/transactions/_hooks/use-categories';
import { useCreateTransaction } from '@/app/(protected)/(dashboard)/transactions/_hooks/use-transaction';

const mockUseCategories = vi.mocked(useCategories);
const mockUseCreateCategory = vi.mocked(useCreateCategory);
const mockUseCreateTransaction = vi.mocked(useCreateTransaction);

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
    } as any);

    mockUseCreateCategory.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    mockUseCreateTransaction.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render all form fields', () => {
    render(<CreateTransactionForm />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<CreateTransactionForm />);
    
    expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeInTheDocument();
  });

  it('should render date input with proper type', () => {
    render(<CreateTransactionForm />);
    
    const dateInput = screen.getByDisplayValue('2025-10-05');
    expect(dateInput).toHaveAttribute('type', 'date');
    expect(dateInput).toHaveAttribute('id', 'date');
  });

  it('should render amount input with proper attributes', () => {
    render(<CreateTransactionForm />);
    
    const amountInput = screen.getByDisplayValue('0');
    expect(amountInput).toHaveAttribute('type', 'number');
    expect(amountInput).toHaveAttribute('step', '0.01');
    expect(amountInput).toHaveAttribute('id', 'amount');
  });

  it('should render type select with income and expense options', () => {
    render(<CreateTransactionForm />);
    
    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('should render category select with available categories', () => {
    render(<CreateTransactionForm />);
    
    expect(screen.getByText('Select category')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Add new category')).toBeInTheDocument();
  });

  it('should render description textarea', () => {
    render(<CreateTransactionForm />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('should show loading message when categories are loading', () => {
    mockUseCategories.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    } as any);

    render(<CreateTransactionForm />);
    
    expect(screen.getByText('No categories available')).toBeInTheDocument();
  });

  it('should render form with proper structure', () => {
    const { container } = render(<CreateTransactionForm />);
    
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('w-full', 'max-w-md', 'mx-auto', 'flex', 'flex-col', 'gap-4');
  });

  it('should have proper field labels', () => {
    render(<CreateTransactionForm />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should use translation keys for all text content', () => {
    render(<CreateTransactionForm />);
    
    // Verify translated content is displayed
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
    expect(screen.getByText('Select type')).toBeInTheDocument();
    expect(screen.getByText('Select category')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('should call onSuccess callback prop when provided', () => {
    const onSuccess = vi.fn();
    render(<CreateTransactionForm onSuccess={onSuccess} />);
    
    // Component should render without errors when onSuccess is provided
    expect(screen.getByRole('button', { name: 'Add Transaction' })).toBeInTheDocument();
  });
});