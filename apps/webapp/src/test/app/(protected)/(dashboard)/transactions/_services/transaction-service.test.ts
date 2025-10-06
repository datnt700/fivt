import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { transactionService } from '@/app/(protected)/(dashboard)/transactions/_services/transaction-service';
import type { CreateTransactionFormValues } from '@/app/(protected)/(dashboard)/transactions/_validations/transaction-schema';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Transaction Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTransaction', () => {
    const mockTransactionData: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 150.75,
      type: 'EXPENSE',
      categoryId: 'cat-123',
      description: 'Grocery shopping',
    };

    it('should create transaction successfully', async () => {
      const mockResponse = {
        id: 'tx-123',
        ...mockTransactionData,
        userId: 'user-123',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await transactionService.createTransaction(mockTransactionData);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTransactionData),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle income transactions', async () => {
      const incomeData: CreateTransactionFormValues = {
        date: '2024-01-15',
        amount: 2500,
        type: 'INCOME',
        categoryId: 'cat-salary',
        description: 'Monthly salary',
      };

      const mockResponse = {
        id: 'tx-456',
        ...incomeData,
        userId: 'user-123',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await transactionService.createTransaction(incomeData);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData),
      });
    });

    it('should handle transactions without description', async () => {
      const dataWithoutDescription = {
        date: '2024-01-15',
        amount: 50,
        type: 'EXPENSE' as const,
        categoryId: 'cat-food',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'tx-789', ...dataWithoutDescription }),
      });

      const result = await transactionService.createTransaction(dataWithoutDescription);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithoutDescription),
      });

      expect(result.id).toBe('tx-789');
    });

    it('should handle API errors with specific error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid category ID' }),
      });

      await expect(transactionService.createTransaction(mockTransactionData))
        .rejects.toThrow('Failed to create transaction');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(transactionService.createTransaction(mockTransactionData))
        .rejects.toThrow('Failed to create transaction');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      await expect(transactionService.createTransaction(mockTransactionData))
        .rejects.toThrow('Network connection failed');
    });

    it('should send correct request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await transactionService.createTransaction(mockTransactionData);

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

      expect(url).toBe('/api/transactions');
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(options.body as string)).toEqual(mockTransactionData);
    });

    it('should handle edge case amounts', async () => {
      const edgeCaseAmounts = [0.01, 999999.99, 123.456];

      for (const amount of edgeCaseAmounts) {
        const testData = { ...mockTransactionData, amount };
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: `tx-${amount}`, ...testData }),
        });

        const result = await transactionService.createTransaction(testData);
        expect(result.amount).toBe(amount);
        
        mockFetch.mockClear();
      }
    });
  });

  describe('getTransactions', () => {
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

    it('should fetch transactions successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      });

      const result = await transactionService.getTransactions();

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        cache: 'no-store',
        headers: {}
      });

      expect(result).toEqual(mockTransactions);
    });

    it('should fetch transactions with locale header', async () => {
      const locale = 'fr';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      });

      const result = await transactionService.getTransactions(locale);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        cache: 'no-store',
        headers: { 'Accept-Language': locale }
      });

      expect(result).toEqual(mockTransactions);
    });

    it('should handle multiple locales', async () => {
      const locales = ['en', 'fr', 'vi'];

      for (const locale of locales) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockTransactions),
        });

        await transactionService.getTransactions(locale);

        expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
          cache: 'no-store',
          headers: { 'Accept-Language': locale }
        });

        mockFetch.mockClear();
      }
    });

    it('should handle empty transactions list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await transactionService.getTransactions();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(transactionService.getTransactions())
        .rejects.toThrow('Failed to load transactions');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(transactionService.getTransactions())
        .rejects.toThrow('Failed to load transactions');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(transactionService.getTransactions())
        .rejects.toThrow('Connection timeout');
    });

    it('should always use no-store cache policy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      });

      await transactionService.getTransactions();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.cache).toBe('no-store');
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(transactionService.getTransactions())
        .rejects.toThrow('Invalid JSON');
    });

    it('should preserve request headers when no locale provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransactions),
      });

      await transactionService.getTransactions();

      const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(options.headers).toEqual({});
    });
  });

  describe('Service Integration', () => {
    it('should handle sequential create and fetch operations', async () => {
      // Mock create transaction
      const createData: CreateTransactionFormValues = {
        date: '2024-01-15',
        amount: 100,
        type: 'EXPENSE',
        categoryId: 'cat-1',
        description: 'Test transaction',
      };

      const createdTransaction = {
        id: 'tx-new',
        ...createData,
        userId: 'user-123',
        createdAt: '2024-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdTransaction),
      });

      // Create transaction
      const createResult = await transactionService.createTransaction(createData);
      expect(createResult).toEqual(createdTransaction);

      // Mock fetch transactions including the new one
      const allTransactions = [createdTransaction];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(allTransactions),
      });

      // Fetch transactions
      const fetchResult = await transactionService.getTransactions();
      expect(fetchResult).toEqual(allTransactions);

      // Verify both API calls
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/transactions', {
        cache: 'no-store',
        headers: {}
      });
    });

    it('should handle concurrent requests properly', async () => {
      // Mock responses for concurrent requests
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'tx-1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ id: 'tx-existing' }]),
        });

      // Make concurrent requests
      const [createResult, fetchResult] = await Promise.all([
        transactionService.createTransaction({
          date: '2024-01-15',
          amount: 100,
          type: 'EXPENSE',
          categoryId: 'cat-1',
        }),
        transactionService.getTransactions('en'),
      ]);

      expect(createResult.id).toBe('tx-1');
      expect(fetchResult).toEqual([{ id: 'tx-existing' }]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle null response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await transactionService.getTransactions();
      expect(result).toBeNull();
    });

    it('should handle undefined response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(undefined),
      });

      const result = await transactionService.getTransactions();
      expect(result).toBeUndefined();
    });

    it('should handle fetch throwing non-Error objects', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      await expect(transactionService.getTransactions())
        .rejects.toBe('String error');
    });

    it('should handle response.json() throwing error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => { throw new Error('JSON parse error'); },
      });

      await expect(transactionService.getTransactions())
        .rejects.toThrow('JSON parse error');
    });
  });
});