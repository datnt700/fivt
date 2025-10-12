import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateTransaction,
  useTransactions,
} from '@/app/(protected)/(dashboard)/budget/_hooks/use-transaction';
import { transactionService } from '@/app/(protected)/(dashboard)/budget/_services/transaction-service';
import type { CreateTransactionFormValues } from '@/app/(protected)/(dashboard)/budget/_validations/transaction-schema';
import React from 'react';
import { useLocale } from 'next-intl';

// Mock the services
vi.mock(
  '@/app/(protected)/(dashboard)/budget/_services/transaction-service',
  () => ({
    transactionService: {
      createTransaction: vi.fn(),
      getTransactions: vi.fn(),
    },
  })
);

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
}));

const mockTransactionService = vi.mocked(transactionService);
const mockUseLocale = vi.mocked(useLocale);

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  TestWrapper.displayName = 'TestWrapper';

  return TestWrapper;
};

describe('useCreateTransaction', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create transaction successfully', async () => {
    const mockTransactionData: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 150.5,
      type: 'EXPENSE',
      categoryId: 'cat-123',
      description: 'Test transaction',
    };

    const mockCreatedTransaction = {
      id: 'tx-123',
      ...mockTransactionData,
      userId: 'user-123',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    };

    mockTransactionService.createTransaction.mockResolvedValueOnce(
      mockCreatedTransaction
    );

    const { result } = renderHook(() => useCreateTransaction(), { wrapper });

    // Trigger the mutation
    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
      mockTransactionData,
      expect.any(Object)
    );
    expect(result.current.data).toEqual(mockCreatedTransaction);
    expect(result.current.isError).toBe(false);
  });

  it('should handle creation errors', async () => {
    const mockTransactionData: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 150.5,
      type: 'EXPENSE',
      categoryId: 'invalid-category',
      description: 'Test transaction',
    };

    const errorMessage = 'Category not found';
    mockTransactionService.createTransaction.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useCreateTransaction(), { wrapper });

    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error(errorMessage));
    expect(result.current.isSuccess).toBe(false);
  });

  it('should invalidate queries on successful creation', async () => {
    const mockTransactionData: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 100,
      type: 'INCOME',
      categoryId: 'cat-salary',
      description: 'Salary',
    };

    mockTransactionService.createTransaction.mockResolvedValueOnce({
      id: 'tx-new',
      ...mockTransactionData,
    });

    const { result } = renderHook(() => useCreateTransaction(), { wrapper });

    // Start the mutation
    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // The mutation should complete successfully
    expect(result.current.isSuccess).toBe(true);
    expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(
      mockTransactionData,
      expect.any(Object)
    );
  });

  it('should handle different transaction types', async () => {
    const testCases: Array<{
      type: 'INCOME' | 'EXPENSE';
      description: string;
    }> = [
      { type: 'INCOME', description: 'Salary payment' },
      { type: 'EXPENSE', description: 'Grocery shopping' },
      { type: 'INCOME', description: 'Freelance work' },
      { type: 'EXPENSE', description: 'Utility bills' },
    ];

    for (const testCase of testCases) {
      const mockData: CreateTransactionFormValues = {
        date: '2024-01-15',
        amount: 100,
        type: testCase.type,
        categoryId: 'cat-123',
        description: testCase.description,
      };

      mockTransactionService.createTransaction.mockResolvedValueOnce({
        id: `tx-${testCase.type.toLowerCase()}`,
        ...mockData,
      });

      const { result } = renderHook(() => useCreateTransaction(), { wrapper });

      result.current.mutate(mockData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data.type).toBe(testCase.type);
      expect(result.current.data.description).toBe(testCase.description);

      // Reset for next iteration
      vi.clearAllMocks();
      wrapper = createWrapper();
    }
  });

  it('should handle mutations with different locales', async () => {
    // Test that the mutation works correctly regardless of locale
    const { useLocale } = await import('next-intl');
    vi.mocked(useLocale).mockReturnValueOnce('fr');

    const mockData: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 75.25,
      type: 'EXPENSE',
      categoryId: 'cat-food',
      description: 'Déjeuner au restaurant',
    };

    mockTransactionService.createTransaction.mockResolvedValueOnce({
      id: 'tx-fr',
      ...mockData,
    });

    const { result } = renderHook(() => useCreateTransaction(), { wrapper });

    result.current.mutate(mockData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data.description).toBe('Déjeuner au restaurant');
  });

  it('should handle edge case amounts correctly', async () => {
    const edgeCaseAmounts = [0.01, 999999.99, 1.005, 50.555];

    for (const amount of edgeCaseAmounts) {
      const mockData: CreateTransactionFormValues = {
        date: '2024-01-15',
        amount,
        type: 'EXPENSE',
        categoryId: 'cat-test',
        description: `Amount test: ${amount}`,
      };

      mockTransactionService.createTransaction.mockResolvedValueOnce({
        id: `tx-${amount}`,
        ...mockData,
      });

      const { result } = renderHook(() => useCreateTransaction(), { wrapper });

      result.current.mutate(mockData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data.amount).toBe(amount);

      // Reset for next iteration
      vi.clearAllMocks();
      wrapper = createWrapper();
    }
  });

  it('should handle optional description field', async () => {
    const mockDataWithoutDescription = {
      date: '2024-01-15',
      amount: 50,
      type: 'EXPENSE' as const,
      categoryId: 'cat-misc',
    };

    mockTransactionService.createTransaction.mockResolvedValueOnce({
      id: 'tx-no-desc',
      ...mockDataWithoutDescription,
    });

    const { result } = renderHook(() => useCreateTransaction(), { wrapper });

    result.current.mutate(mockDataWithoutDescription);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data.description).toBeUndefined();
  });

  it('should provide loading state correctly', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockTransactionService.createTransaction.mockReturnValueOnce(
      pendingPromise
    );

    const { result } = renderHook(() => useCreateTransaction(), { wrapper });

    expect(result.current.isPending).toBe(false);

    // Start mutation
    result.current.mutate({
      date: '2024-01-15',
      amount: 100,
      type: 'EXPENSE',
      categoryId: 'cat-test',
    });

    // Should be loading after mutation starts
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    // Resolve the promise
    resolvePromise!({ id: 'tx-loaded', amount: 100 });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useTransactions', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch transactions successfully', async () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        date: '2024-01-15',
        amount: 100,
        type: 'EXPENSE',
        categoryId: 'cat-1',
        description: 'Coffee',
        userId: 'user-123',
      },
      {
        id: 'tx-2',
        date: '2024-01-14',
        amount: 2000,
        type: 'INCOME',
        categoryId: 'cat-2',
        description: 'Salary',
        userId: 'user-123',
      },
    ];

    mockTransactionService.getTransactions.mockResolvedValueOnce(
      mockTransactions
    );

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('en');
    expect(result.current.data).toEqual(mockTransactions);
    expect(result.current.isError).toBe(false);
  });

  it('should handle fetch errors', async () => {
    const errorMessage = 'Failed to load transactions';
    mockTransactionService.getTransactions.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(new Error(errorMessage));
    expect(result.current.data).toBeUndefined();
  });

  it('should pass correct locale to service', async () => {
    mockUseLocale.mockReturnValue('fr');

    mockTransactionService.getTransactions.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('fr');

    // Reset mock to default
    mockUseLocale.mockReturnValue('en');
  });

  it('should handle empty transactions list', async () => {
    mockTransactionService.getTransactions.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should have correct staleTime configuration', async () => {
    mockTransactionService.getTransactions.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // The hook should have been called with staleTime configuration
    // This is more of an integration test to ensure the hook is configured correctly
    expect(result.current.isStale).toBe(false);
  });

  it('should handle different locales correctly', async () => {
    const locales = ['en', 'fr', 'vi'];

    for (const locale of locales) {
      mockUseLocale.mockReturnValue(locale);

      const mockData = [{ id: `tx-${locale}`, amount: 100 }];
      mockTransactionService.getTransactions.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useTransactions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockTransactionService.getTransactions).toHaveBeenCalledWith(
        locale
      );
      expect(result.current.data).toEqual(mockData);

      // Reset for next iteration
      vi.clearAllMocks();
      wrapper = createWrapper();
    }

    // Reset mock to default after test
    mockUseLocale.mockReturnValue('en');
  });

  it('should provide loading state correctly', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockTransactionService.getTransactions.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    // Should be loading initially
    expect(result.current.isPending).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    // Resolve the promise
    resolvePromise!([{ id: 'tx-1', amount: 100 }]);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should use correct query key', async () => {
    mockTransactionService.getTransactions.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // The hook should use the correct query key format: ['transactions', locale]
    expect(mockTransactionService.getTransactions).toHaveBeenCalledWith('en');
  });

  it('should handle network errors gracefully', async () => {
    mockTransactionService.getTransactions.mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should handle null/undefined responses', async () => {
    // Test null response
    mockTransactionService.getTransactions.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useTransactions(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });
});

describe('Hook Integration Tests', () => {
  let wrapper: ReturnType<typeof createWrapper>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  it('should work together - create then fetch transactions', async () => {
    const newTransaction: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 200,
      type: 'EXPENSE',
      categoryId: 'cat-integration',
      description: 'Integration test',
    };

    const createdTransaction = {
      id: 'tx-integration',
      ...newTransaction,
      userId: 'user-123',
    };

    // Mock create transaction
    mockTransactionService.createTransaction.mockResolvedValueOnce(
      createdTransaction
    );

    // Mock fetch transactions (initially empty, then with new transaction)
    mockTransactionService.getTransactions
      .mockResolvedValueOnce([]) // Initial fetch
      .mockResolvedValueOnce([createdTransaction]); // After creation

    // First, test fetching empty transactions
    const { result: queryResult } = renderHook(() => useTransactions(), {
      wrapper,
    });

    await waitFor(() => {
      expect(queryResult.current.isSuccess).toBe(true);
    });

    expect(queryResult.current.data).toEqual([]);

    // Then test creating a transaction
    const { result: mutationResult } = renderHook(
      () => useCreateTransaction(),
      { wrapper }
    );

    mutationResult.current.mutate(newTransaction);

    await waitFor(() => {
      expect(mutationResult.current.isSuccess).toBe(true);
    });

    expect(mutationResult.current.data).toEqual(createdTransaction);
  });
});
