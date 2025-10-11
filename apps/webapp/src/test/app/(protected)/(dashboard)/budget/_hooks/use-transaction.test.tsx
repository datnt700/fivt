import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTransactions,
  useCreateTransaction,
} from '@/app/(protected)/(dashboard)/budget/_hooks/use-transaction';

vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'en'),
}));

vi.mock(
  '@/app/(protected)/(dashboard)/budget/_services/transaction-service',
  () => ({
    transactionService: {
      getTransactions: vi.fn(),
      createTransaction: vi.fn(),
    },
  })
);

import { transactionService } from '@/app/(protected)/(dashboard)/budget/_services/transaction-service';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  TestWrapper.displayName = 'TestWrapper';

  return TestWrapper;
};

describe('use-transaction hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [
        {
          id: '1',
          date: '2024-01-01',
          amount: '100.00',
          type: 'EXPENSE',
          description: 'Test transaction',
          category: { id: '1', name: 'Food' },
        },
        {
          id: '2',
          date: '2024-01-02',
          amount: '50.00',
          type: 'INCOME',
          description: 'Test income',
          category: { id: '2', name: 'Salary' },
        },
      ];

      vi.mocked(transactionService.getTransactions).mockResolvedValue(
        mockTransactions
      );

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockTransactions);
      expect(result.current.error).toBeNull();
      expect(transactionService.getTransactions).toHaveBeenCalledWith('en');
    });

    it('should handle fetch error', async () => {
      const mockError = new Error('Failed to fetch');
      vi.mocked(transactionService.getTransactions).mockRejectedValue(
        mockError
      );

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should handle empty transactions list', async () => {
      vi.mocked(transactionService.getTransactions).mockResolvedValue([]);

      const { result } = renderHook(() => useTransactions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('useCreateTransaction', () => {
    it('should create transaction successfully', async () => {
      const mockTransactionData = {
        date: '2024-01-01',
        amount: 100,
        type: 'EXPENSE' as const,
        description: 'Test transaction',
        categoryId: '1',
      };

      const mockResult = {
        id: '3',
        ...mockTransactionData,
        amount: '100.00',
        category: { id: '1', name: 'Food' },
      };

      vi.mocked(transactionService.createTransaction).mockResolvedValue(
        mockResult
      );

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockTransactionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResult);
      expect(transactionService.createTransaction).toHaveBeenCalledWith(
        mockTransactionData,
        expect.any(Object)
      );
    });

    it('should handle create error', async () => {
      const mockError = new Error('Create failed');
      vi.mocked(transactionService.createTransaction).mockRejectedValue(
        mockError
      );

      const mockTransactionData = {
        date: '2024-01-01',
        amount: 100,
        type: 'EXPENSE' as const,
        description: 'Error transaction',
        categoryId: '1',
      };

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockTransactionData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);
    });

    it('should handle income transactions', async () => {
      const mockIncomeData = {
        date: '2024-01-01',
        amount: 2000,
        type: 'INCOME' as const,
        description: 'Salary',
        categoryId: '2',
      };

      const mockResult = {
        id: '4',
        ...mockIncomeData,
        amount: '2000.00',
        category: { id: '2', name: 'Salary' },
      };

      vi.mocked(transactionService.createTransaction).mockResolvedValue(
        mockResult
      );

      const { result } = renderHook(() => useCreateTransaction(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(mockIncomeData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResult);
    });
  });
});

/*
import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTransactions, useCreateTransaction } from '@/app/(protected)/(dashboard)/budget/_hooks/use-transaction';
import { transactionService } from '@/app/(protected)/(dashboard)/budget/_services/transaction-service';
import { createQueryClientWrapper, createQueryClientWrapperWithClient, mockUseLocale } from '@/test/common/utils';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: mockUseLocale,
}));

// Mock transaction service
vi.mock('@/app/(protected)/(dashboard)/budget/_services/transaction-service', () => ({
  transactionService: {
    getTransactions: vi.fn(),
    createTransaction: vi.fn(),
  },
}));

// Use common wrapper from test utils
const createWrapper = createQueryClientWrapper;

// TODO: Fix Vitest mock hoisting issues - complex hook mocking patterns need refactoring
describe.skip('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue('en');
  });

  it('should fetch transactions successfully', async () => {
    const mockTransactions = [
      {
        id: '1',
        date: '2024-01-01',
        amount: '100.00',
        type: 'EXPENSE',
        description: 'Test transaction',
        category: { id: '1', name: 'Food' },
      },
    ];

    vi.mocked(transactionService.getTransactions).mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTransactions);
    expect(result.current.error).toBeNull();
    expect(transactionService.getTransactions).toHaveBeenCalledWith('en');
  });

  it('should handle fetch transactions error', async () => {
    const mockError = new Error('Failed to fetch transactions');
    vi.mocked(transactionService.getTransactions).mockRejectedValue(mockError);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('should use correct query key with locale', () => {
    mockUseLocale.mockReturnValue('fr');

    vi.mocked(transactionService.getTransactions).mockResolvedValue([]);

    renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    expect(transactionService.getTransactions).toHaveBeenCalledWith('fr');
  });

  it('should have correct stale time configuration', () => {
    vi.mocked(transactionService.getTransactions).mockResolvedValue([]);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    // The stale time should be 5 minutes (5 * 60 * 1000 ms)
    // This is internal to React Query, but we can verify the hook doesn't throw
    expect(result.current).toBeDefined();
  });
});

// TODO: Fix Vitest mock hoisting issues - complex hook mocking patterns need refactoring
describe.skip('useCreateTransaction', () => {
  let queryClient: any;
  let createWrapperWithClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue('en');
    
    // Use common wrapper with client access
    const { wrapper, queryClient: client } = createQueryClientWrapperWithClient();
    queryClient = client;
    createWrapperWithClient = () => wrapper;
  });

  it('should create transaction successfully', async () => {
    const mockTransactionData = {
      date: '2024-01-01',
      amount: 100,
      type: 'EXPENSE' as const,
      description: 'Test transaction',
      categoryId: '1',
    };

    const mockCreatedTransaction = {
      id: '1',
      ...mockTransactionData,
      amount: '100.00',
      category: { id: '1', name: 'Food' },
    };

    vi.mocked(transactionService.createTransaction).mockResolvedValue(mockCreatedTransaction);

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    expect(result.current.isPending).toBe(false);

    result.current.mutate(mockTransactionData);

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockCreatedTransaction);
    expect(transactionService.createTransaction).toHaveBeenCalledWith(mockTransactionData);
  });

  it('should handle create transaction error', async () => {
    const mockError = new Error('Failed to create transaction');
    vi.mocked(transactionService.createTransaction).mockRejectedValue(mockError);

    const mockTransactionData = {
      date: '2024-01-01',
      amount: 100,
      type: 'EXPENSE' as const,
      description: 'Test transaction',
      categoryId: '1',
    };

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(mockError);
  });

  it('should invalidate transactions query on success', async () => {
    const mockTransactionData = {
      date: '2024-01-01',
      amount: 100,
      type: 'EXPENSE' as const,
      description: 'Test transaction',
      categoryId: '1',
    };

    vi.mocked(transactionService.createTransaction).mockResolvedValue({});

    // Set up initial query data
    queryClient.setQueryData(['transactions', 'en'], []);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['transactions', 'en'],
    });
  });

  it('should use correct locale for query invalidation', async () => {
    mockUseLocale.mockReturnValue('vi');

    const mockTransactionData = {
      date: '2024-01-01',
      amount: 100,
      type: 'INCOME' as const,
      description: 'Test income',
      categoryId: '2',
    };

    vi.mocked(transactionService.createTransaction).mockResolvedValue({});

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['transactions', 'vi'],
    });
  });

  it('should handle mutateAsync correctly', async () => {
    const mockTransactionData = {
      date: '2024-01-01',
      amount: 50,
      type: 'EXPENSE' as const,
      description: 'Async test',
      categoryId: '1',
    };

    const mockResult = { id: '2', ...mockTransactionData };
    vi.mocked(transactionService.createTransaction).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    const asyncResult = await result.current.mutateAsync(mockTransactionData);

    expect(asyncResult).toEqual(mockResult);
    expect(result.current.isSuccess).toBe(true);
  });

  it('should handle mutateAsync error', async () => {
    const mockError = new Error('Async error');
    vi.mocked(transactionService.createTransaction).mockRejectedValue(mockError);

    const mockTransactionData = {
      date: '2024-01-01',
      amount: 50,
      type: 'EXPENSE' as const,
      description: 'Async error test',
      categoryId: '1',
    };

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    await expect(result.current.mutateAsync(mockTransactionData)).rejects.toThrow('Async error');
    expect(result.current.isError).toBe(true);
  });

  it('should reset mutation state correctly', async () => {
    vi.mocked(transactionService.createTransaction).mockResolvedValue({});

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapperWithClient(),
    });

    const mockTransactionData = {
      date: '2024-01-01',
      amount: 100,
      type: 'EXPENSE' as const,
      description: 'Reset test',
      categoryId: '1',
    };

    // Make a successful mutation
    result.current.mutate(mockTransactionData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Reset the mutation
    result.current.reset();

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isPending).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});
*/
