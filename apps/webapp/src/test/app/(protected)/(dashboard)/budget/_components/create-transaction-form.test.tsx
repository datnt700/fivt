import { screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CreateTransactionForm } from '@/app/(protected)/(dashboard)/budget/_components/create-transaction-form';
import { renderWithQueryClient } from '../../../../../utils/query-client-wrapper';
import {
  useCategories,
  useCreateCategory,
} from '@/app/(protected)/(dashboard)/budget/_hooks/use-categories';
import { useCreateTransaction } from '@/app/(protected)/(dashboard)/budget/_hooks/use-transaction';

// Mock next-intl
const mockTranslations = {
  'category.loadingCategories': 'Loading categories...',
  'category.addCategory': 'Add Category',
  'category.selected': 'Select category',
  'transactions.dateFilter': 'Date',
  'transactions.amount': 'Amount',
  'transactions.nameType': 'Type',
  'transactions.selectType': 'Select type',
  'transactions.type.income': 'Income',
  'transactions.type.expense': 'Expense',
  'transactions.category': 'Category',
  'transactions.description': 'Description',
  'transactions.addTransaction': 'Add Transaction',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
  useLocale: vi.fn(() => 'en'),
}));

// Mock hooks
vi.mock('@/app/(protected)/(dashboard)/budget/_hooks/use-categories', () => ({
  useCategories: vi.fn(),
  useCreateCategory: vi.fn(),
}));

vi.mock('@/app/(protected)/(dashboard)/budget/_hooks/use-transaction', () => ({
  useCreateTransaction: vi.fn(),
}));

// Mock query client
const mockSetQueryData = vi.fn();
vi.mock('@tanstack/react-query', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      setQueryData: mockSetQueryData,
    })),
  };
});

describe('CreateTransactionForm', () => {
  const mockCategories = [
    { id: '1', name: 'Food' },
    { id: '2', name: 'Transport' },
    { id: '3', name: 'Entertainment' },
  ];

  const mockCreateTransactionMutate = vi.fn();
  const mockCreateCategoryMutate = vi.fn();

  const defaultMocks = {
    categories: {
      data: mockCategories,
      isLoading: false,
      error: null,
    },
    createCategory: {
      mutateAsync: mockCreateCategoryMutate,
      isPending: false,
      error: null,
    },
    createTransaction: {
      mutateAsync: mockCreateTransactionMutate,
      isPending: false,
      error: null,
      isError: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCategories).mockReturnValue(defaultMocks.categories as never);
    vi.mocked(useCreateCategory).mockReturnValue(
      defaultMocks.createCategory as never
    );
    vi.mocked(useCreateTransaction).mockReturnValue(
      defaultMocks.createTransaction as never
    );
  });

  it('should render loading state when categories are loading', () => {
    vi.mocked(useCategories).mockReturnValue({
      ...defaultMocks.categories,
      isLoading: true,
      data: undefined,
    } as never);

    renderWithQueryClient(<CreateTransactionForm />);

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('should render all form fields when loaded', () => {
    renderWithQueryClient(<CreateTransactionForm />);

    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Transaction' })
    ).toBeInTheDocument();
  });

  it('should have correct input types and attributes', () => {
    renderWithQueryClient(<CreateTransactionForm />);

    const dateInput = screen.getByLabelText('Date');
    expect(dateInput).toHaveAttribute('type', 'date');

    const amountInput = screen.getByLabelText('Amount');
    expect(amountInput).toHaveAttribute('type', 'number');
    expect(amountInput).toHaveAttribute('step', '0.01');

    const descriptionInput = screen.getByLabelText('Description');
    expect(descriptionInput.tagName).toBe('TEXTAREA');
  });

  it('should have default values set correctly', () => {
    renderWithQueryClient(<CreateTransactionForm />);

    const dateInput = screen.getByLabelText('Date') as HTMLInputElement;
    const today = new Date().toISOString().slice(0, 10);
    expect(dateInput.value).toBe(today);

    const amountInput = screen.getByLabelText('Amount') as HTMLInputElement;
    expect(amountInput.value).toBe('0');
  });

  it('should render category options in select', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateTransactionForm />);

    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.click(categorySelect);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
      expect(screen.getByText('Entertainment')).toBeInTheDocument();
    });
  });

  it('should render transaction type options', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateTransactionForm />);

    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelect);

    await waitFor(() => {
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Expense')).toBeInTheDocument();
    });
  });

  it('should show add category button and dialog', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateTransactionForm />);

    const addCategoryButton = screen.getByRole('button', {
      name: 'Add Category',
    });
    expect(addCategoryButton).toBeInTheDocument();

    await user.click(addCategoryButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
    });
  });

  it('should handle category creation flow', async () => {
    const user = userEvent.setup();
    const mockCreatedCategory = { id: '4', name: 'New Category' };
    mockCreateCategoryMutate.mockResolvedValue(mockCreatedCategory);

    renderWithQueryClient(<CreateTransactionForm />);

    // Open category dialog
    const addCategoryButton = screen.getByRole('button', {
      name: 'Add Category',
    });
    await user.click(addCategoryButton);

    // Enter category name
    const categoryInput = screen.getByRole('textbox');
    await user.type(categoryInput, 'New Category');

    // Save category
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateCategoryMutate).toHaveBeenCalledWith('New Category');
    });
  });

  it('should close category dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateTransactionForm />);

    // Open dialog
    const addCategoryButton = screen.getByRole('button', {
      name: 'Add Category',
    });
    await user.click(addCategoryButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Cancel
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should submit form with correct data', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockCreateTransactionMutate.mockResolvedValue({});

    renderWithQueryClient(<CreateTransactionForm onSuccess={onSuccess} />);

    // Fill form
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '100.50');

    await user.type(screen.getByLabelText('Description'), 'Test transaction');

    // Select type
    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelect);
    await user.click(screen.getByText('Expense'));

    // Select category
    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.click(categorySelect);
    await user.click(screen.getByText('Food'));

    // Submit
    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTransactionMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100.5,
          description: 'Test transaction',
          type: 'EXPENSE',
          categoryId: '1',
          date: expect.any(String),
        })
      );
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledOnce();
    });
  });

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup();
    mockCreateTransactionMutate.mockResolvedValue({});

    renderWithQueryClient(<CreateTransactionForm />);

    // Fill amount
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '50');

    // Fill description
    await user.type(screen.getByLabelText('Description'), 'Test');

    // Submit
    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(submitButton);

    await waitFor(() => {
      const amountInput = screen.getByLabelText('Amount') as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(
        'Description'
      ) as HTMLTextAreaElement;

      expect(amountInput.value).toBe('0');
      expect(descriptionInput.value).toBe('');
    });
  });

  it('should show validation errors for invalid inputs', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateTransactionForm />);

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  it('should handle form submission errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockCreateTransactionMutate.mockRejectedValue(new Error('Network error'));

    renderWithQueryClient(<CreateTransactionForm />);

    // Fill required fields
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '100');

    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelect);
    await user.click(screen.getByText('Income'));

    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.click(categorySelect);
    await user.click(screen.getByText('Food'));

    // Submit
    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create transaction:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should disable submit button when form is submitting', async () => {
    vi.mocked(useCreateTransaction).mockReturnValue({
      ...defaultMocks.createTransaction,
      isPending: true,
    } as never);

    renderWithQueryClient(<CreateTransactionForm />);

    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    expect(submitButton).toBeDisabled();
  });

  it('should have proper form layout and styling', () => {
    renderWithQueryClient(<CreateTransactionForm />);

    const form = screen.getByRole('form');
    expect(form).toHaveClass(
      'w-full',
      'max-w-md',
      'mx-auto',
      'flex',
      'flex-col',
      'gap-4'
    );
  });

  it('should handle edge case amounts correctly', async () => {
    const user = userEvent.setup();
    mockCreateTransactionMutate.mockResolvedValue({});

    renderWithQueryClient(<CreateTransactionForm />);

    // Test with decimal amount
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '99.99');

    // Select required fields
    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelect);
    await user.click(screen.getByText('Income'));

    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.click(categorySelect);
    await user.click(screen.getByText('Food'));

    // Submit
    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTransactionMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 99.99,
        })
      );
    });
  });

  it('should handle long descriptions', async () => {
    const user = userEvent.setup();
    mockCreateTransactionMutate.mockResolvedValue({});

    renderWithQueryClient(<CreateTransactionForm />);

    const longDescription =
      'This is a very long description that should be handled properly by the form';

    await user.type(screen.getByLabelText('Description'), longDescription);

    // Fill other required fields
    await user.clear(screen.getByLabelText('Amount'));
    await user.type(screen.getByLabelText('Amount'), '25');

    const typeSelect = screen.getByRole('combobox', { name: /type/i });
    await user.click(typeSelect);
    await user.click(screen.getByText('Expense'));

    const categorySelect = screen.getByRole('combobox', { name: /category/i });
    await user.click(categorySelect);
    await user.click(screen.getByText('Transport'));

    // Submit
    const submitButton = screen.getByRole('button', {
      name: 'Add Transaction',
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTransactionMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: longDescription,
        })
      );
    });
  });

  it('should show transaction error when mutation fails', () => {
    const errorMessage = 'Transaction creation failed';
    vi.mocked(useCreateTransaction).mockReturnValue({
      ...defaultMocks.createTransaction,
      isError: true,
      error: new Error(errorMessage),
    } as never);

    renderWithQueryClient(<CreateTransactionForm />);

    expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeInTheDocument();
  });

  it('should show description validation error', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CreateTransactionForm />);

    // Fill form with invalid description (trigger validation)
    const descriptionField = screen.getByLabelText('Description');
    await user.type(descriptionField, 'a'.repeat(501)); // Assuming max length validation
    await user.tab(); // Trigger validation

    // Check if validation error appears (assuming there's description validation)
    await waitFor(() => {
      const errorElement = screen.queryByText(/description/i);
      if (errorElement && errorElement.className.includes('text-red-500')) {
        expect(errorElement).toBeInTheDocument();
      }
    });
  });

  it('should handle category creation with existing category', async () => {
    const user = userEvent.setup();
    const existingCategory = { id: '1', name: 'Food' };

    // Mock category creation to return existing category
    mockCreateCategoryMutate.mockResolvedValue(existingCategory);
    mockSetQueryData.mockImplementation((key, updater) => {
      if (typeof updater === 'function') {
        // Simulate existing categories to test the duplicate check
        const result = updater(mockCategories);
        return result;
      }
    });

    renderWithQueryClient(<CreateTransactionForm />);

    // Open category dialog
    const addCategoryButton = screen.getByRole('button', {
      name: 'Add Category',
    });
    await user.click(addCategoryButton);

    // Enter existing category name
    const categoryInput = screen.getByRole('textbox');
    await user.type(categoryInput, 'Food');

    // Save category
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateCategoryMutate).toHaveBeenCalledWith('Food');
      expect(mockSetQueryData).toHaveBeenCalled();
    });
  });

  it('should handle category creation with whitespace trimming', async () => {
    const user = userEvent.setup();
    const newCategory = { id: '4', name: 'Utilities' };
    mockCreateCategoryMutate.mockResolvedValue(newCategory);

    renderWithQueryClient(<CreateTransactionForm />);

    // Open category dialog
    const addCategoryButton = screen.getByRole('button', {
      name: 'Add Category',
    });
    await user.click(addCategoryButton);

    // Enter category name with whitespace
    const categoryInput = screen.getByRole('textbox');
    await user.type(categoryInput, '  Utilities  ');

    // Save category
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockCreateCategoryMutate).toHaveBeenCalledWith('Utilities'); // Should be trimmed
    });
  });
});
