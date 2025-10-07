import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getFinancialProfile,
  createFinancialProfile,
  deleteFinancialProfile,
  recalculateFinancialProfile,
  useFinancialProfileQuery,
  FINANCIAL_PROFILE_QUERY_KEY,
} from '@/services/financial-profile-api';
import type { FinancialProfileInput } from '@/types/financial-profile';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Financial Profile API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getFinancialProfile', () => {
    it('should fetch financial profile successfully', async () => {
      const mockResponse = {
        profile: {
          id: 'profile-123',
          monthlyIncome: 5000,
          monthlyExpenses: 3000,
          savingsGoal: 10000,
          riskTolerance: 'medium',
        },
        insights: ['Good savings rate', 'Consider increasing investments'],
        recommendations: ['Open high-yield savings account'],
        calculatedAt: '2024-01-01T00:00:00Z',
        source: 'user_input',
        message: 'Profile calculated successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getFinancialProfile();

      expect(mockFetch).toHaveBeenCalledWith('/api/financial-profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        error: 'Profile not found',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Profile not found',
      });
    });

    it('should handle API error without error message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch financial profile',
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Network connection failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Invalid JSON',
      });
    });
  });

  describe('createFinancialProfile', () => {
    const mockInput: FinancialProfileInput = {
      income: {
        gross: 60000,
        net: 45000,
      },
      expenses: {
        annual: 36000,
        monthly: 3000,
      },
      investments: {
        annual: 9000,
        monthly: 750,
      },
      netWorth: 15000,
      age: 30,
      debt: 2000,
    };

    it('should create financial profile successfully', async () => {
      const mockResponse = {
        profile: {
          id: 'profile-123',
          ...mockInput,
        },
        insights: ['Profile created successfully'],
        recommendations: ['Start emergency fund'],
        calculatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await createFinancialProfile(mockInput);

      expect(mockFetch).toHaveBeenCalledWith('/api/financial-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockInput),
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should handle validation errors with details', async () => {
      const errorResponse = {
        error: 'Validation failed',
        details: ['Monthly income must be positive', 'Age is required'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      const result = await createFinancialProfile(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'Validation failed',
        details: ['Monthly income must be positive', 'Age is required'],
      });
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      const result = await createFinancialProfile(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should handle network errors during creation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      const result = await createFinancialProfile(mockInput);

      expect(result).toEqual({
        success: false,
        error: 'Connection timeout',
      });
    });

    it('should send correct request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ profile: {} }),
      });

      await createFinancialProfile(mockInput);

      const [, requestOptions] = mockFetch.mock.calls[0] as [string, RequestInit & { body: string }];
      const body = JSON.parse(requestOptions.body);

      expect(body).toEqual(mockInput);
      expect(requestOptions.method).toBe('POST');
      expect((requestOptions.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });
  });

  describe('deleteFinancialProfile', () => {
    it('should delete financial profile successfully', async () => {
      const mockResponse = {
        message: 'Financial profile deleted successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await deleteFinancialProfile();

      expect(mockFetch).toHaveBeenCalledWith('/api/financial-profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Profile not found' }),
      });

      const result = await deleteFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Profile not found',
      });
    });

    it('should handle network errors during deletion', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await deleteFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });
  });

  describe('recalculateFinancialProfile', () => {
    it('should recalculate financial profile successfully', async () => {
      const mockResponse = {
        profile: {
          id: 'profile-123',
          monthlyIncome: 5000,
          monthlyExpenses: 3000,
        },
        insights: ['Recalculated with latest data'],
        recommendations: ['Updated recommendations'],
        calculatedAt: '2024-01-02T00:00:00Z',
        source: 'recalculation',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await recalculateFinancialProfile();

      expect(mockFetch).toHaveBeenCalledWith('/api/financial-profile/recalculate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should handle recalculation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'No profile data available' }),
      });

      const result = await recalculateFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'No profile data available',
      });
    });

    it('should handle server errors during recalculation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const result = await recalculateFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Failed to recalculate financial profile',
      });
    });
  });

  describe('React Query Integration', () => {
    it('should provide correct query key constant', () => {
      expect(FINANCIAL_PROFILE_QUERY_KEY).toEqual(['financial-profile']);
    });

    it('should return correct query configuration', () => {
      const queryConfig = useFinancialProfileQuery();

      expect(queryConfig.queryKey).toEqual(['financial-profile']);
      expect(queryConfig.queryFn).toBe(getFinancialProfile);
    });

    it('should provide stable query key reference', () => {
      const config1 = useFinancialProfileQuery();
      const config2 = useFinancialProfileQuery();

      expect(config1.queryKey).toBe(config2.queryKey);
      expect(config1.queryFn).toBe(config2.queryFn);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle responses with malformed JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      });

      const result = await getFinancialProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected token');
    });

    it('should handle fetch throwing non-Error objects', async () => {
      mockFetch.mockRejectedValueOnce({ message: 'Custom error object' });

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle undefined error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(undefined),
      });

      const result = await getFinancialProfile();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });

    it('should handle null responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await getFinancialProfile();

      expect(result).toEqual({
        success: true,
        data: null,
      });
    });
  });

  describe('Request Configuration', () => {
    it('should use correct headers for all requests', async () => {
      const expectedHeaders = {
        'Content-Type': 'application/json',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      // Test all API methods
      await getFinancialProfile();
      await createFinancialProfile({} as FinancialProfileInput);
      await deleteFinancialProfile();
      await recalculateFinancialProfile();

      // Verify all calls used correct headers
      mockFetch.mock.calls.forEach(([, options]) => {
        expect(options.headers).toEqual(expectedHeaders);
      });
    });

    it('should use correct HTTP methods', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await getFinancialProfile();
      await createFinancialProfile({} as FinancialProfileInput);
      await deleteFinancialProfile();
      await recalculateFinancialProfile();

      expect((mockFetch.mock.calls[0] as [string, RequestInit])[1].method).toBe('GET');
      expect((mockFetch.mock.calls[1] as [string, RequestInit])[1].method).toBe('POST');
      expect((mockFetch.mock.calls[2] as [string, RequestInit])[1].method).toBe('DELETE');
      expect((mockFetch.mock.calls[3] as [string, RequestInit])[1].method).toBe('PUT');
    });

    it('should use correct endpoints', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await getFinancialProfile();
      await createFinancialProfile({} as FinancialProfileInput);
      await deleteFinancialProfile();
      await recalculateFinancialProfile();

      expect((mockFetch.mock.calls[0] as [string, RequestInit])[0]).toBe('/api/financial-profile');
      expect((mockFetch.mock.calls[1] as [string, RequestInit])[0]).toBe('/api/financial-profile');
      expect((mockFetch.mock.calls[2] as [string, RequestInit])[0]).toBe('/api/financial-profile');
      expect((mockFetch.mock.calls[3] as [string, RequestInit])[0]).toBe('/api/financial-profile/recalculate');
    });
  });
});