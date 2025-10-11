import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { transactionService } from '@/app/(protected)/(dashboard)/budget/_services/transaction-service';
import type { CreateTransactionFormValues } from '@/app/(protected)/(dashboard)/budget/_validations/transaction-schema';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('transactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createTransaction', () => {
    const mockTransactionData: CreateTransactionFormValues = {
      date: '2024-01-01',
      amount: 100.5,
      type: 'EXPENSE',
      description: 'Test transaction',
      categoryId: 'category-1',
    };

    it('should create transaction successfully', async () => {
      const mockResponse = {
        id: 'transaction-1',
        ...mockTransactionData,
        amount: '100.50',
        category: { id: 'category-1', name: 'Food' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result =
        await transactionService.createTransaction(mockTransactionData);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTransactionData),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(
        transactionService.createTransaction(mockTransactionData)
      ).rejects.toThrow('Failed to create transaction');

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockTransactionData),
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        transactionService.createTransaction(mockTransactionData)
      ).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(
        transactionService.createTransaction(mockTransactionData)
      ).rejects.toThrow('Invalid JSON');
    });

    it('should send correct data for income transaction', async () => {
      const incomeData: CreateTransactionFormValues = {
        date: '2024-01-15',
        amount: 2500,
        type: 'INCOME',
        description: 'Salary',
        categoryId: 'category-2',
      };

      const mockResponse = {
        id: 'transaction-2',
        ...incomeData,
        amount: '2500.00',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await transactionService.createTransaction(incomeData);

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle transaction without description', async () => {
      const transactionDataNoDesc: CreateTransactionFormValues = {
        date: '2024-01-01',
        amount: 50,
        type: 'EXPENSE',
        categoryId: 'category-1',
      };

      const mockResponse = {
        id: 'transaction-3',
        ...transactionDataNoDesc,
        amount: '50.00',
        description: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await transactionService.createTransaction(
        transactionDataNoDesc
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle decimal amounts correctly', async () => {
      const decimalData: CreateTransactionFormValues = {
        date: '2024-01-01',
        amount: 99.99,
        type: 'EXPENSE',
        description: 'Decimal test',
        categoryId: 'category-1',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 'transaction-4',
          ...decimalData,
          amount: '99.99',
        }),
      });

      await transactionService.createTransaction(decimalData);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs).toBeDefined();
      const requestBody = JSON.parse(callArgs![1].body);
      expect(requestBody.amount).toBe(99.99);
    });
  });

  describe('getTransactions', () => {
    const mockTransactions = [
      {
        id: 'transaction-1',
        date: '2024-01-01',
        amount: '100.50',
        type: 'EXPENSE',
        description: 'Test transaction',
        category: { id: 'category-1', name: 'Food' },
      },
      {
        id: 'transaction-2',
        date: '2024-01-02',
        amount: '2500.00',
        type: 'INCOME',
        description: 'Salary',
        category: { id: 'category-2', name: 'Salary' },
      },
    ];

    it('should fetch transactions successfully without locale', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockTransactions),
      });

      const result = await transactionService.getTransactions();

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        cache: 'no-store',
        headers: {},
      });

      expect(result).toEqual(mockTransactions);
    });

    it('should fetch transactions successfully with locale', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockTransactions),
      });

      const result = await transactionService.getTransactions('fr');

      expect(mockFetch).toHaveBeenCalledWith('/api/transactions', {
        cache: 'no-store',
        headers: { 'Accept-Language': 'fr' },
      });

      expect(result).toEqual(mockTransactions);
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(transactionService.getTransactions()).rejects.toThrow(
        'Failed to load transactions'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(transactionService.getTransactions()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(transactionService.getTransactions()).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should handle empty transactions list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce([]),
      });

      const result = await transactionService.getTransactions();

      expect(result).toEqual([]);
    });

    it('should use no-store cache policy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockTransactions),
      });

      await transactionService.getTransactions();

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs![1].cache).toBe('no-store');
    });

    it('should handle different locales correctly', async () => {
      const locales = ['en', 'fr', 'vi', 'es'];

      for (const locale of locales) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValueOnce(mockTransactions),
        });

        await transactionService.getTransactions(locale);

        expect(mockFetch).toHaveBeenLastCalledWith('/api/transactions', {
          cache: 'no-store',
          headers: { 'Accept-Language': locale },
        });
      }

      expect(mockFetch).toHaveBeenCalledTimes(locales.length);
    });

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(transactionService.getTransactions()).rejects.toThrow(
        'Failed to load transactions'
      );
    });

    it('should handle malformed response data gracefully', async () => {
      const malformedData = { invalid: 'structure' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(malformedData),
      });

      const result = await transactionService.getTransactions();

      // Service should return whatever the API returns, even if malformed
      expect(result).toEqual(malformedData);
    });
  });
});
