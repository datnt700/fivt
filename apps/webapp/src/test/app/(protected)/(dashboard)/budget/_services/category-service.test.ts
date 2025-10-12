import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { categoryService } from '@/app/(protected)/(dashboard)/budget/_services/category-service';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCategories', () => {
    const mockCategories = [
      { id: 'category-1', name: 'Food' },
      { id: 'category-2', name: 'Transport' },
      { id: 'category-3', name: 'Entertainment' },
    ];

    it('should fetch categories successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockCategories),
      });

      const result = await categoryService.getCategories();

      expect(mockFetch).toHaveBeenCalledWith('/api/category', {
        cache: 'no-store',
      });

      expect(result).toEqual(mockCategories);
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(categoryService.getCategories()).rejects.toThrow(
        'Failed to load categories'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(categoryService.getCategories()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(categoryService.getCategories()).rejects.toThrow(
        'Invalid JSON'
      );
    });

    it('should handle empty categories list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce([]),
      });

      const result = await categoryService.getCategories();

      expect(result).toEqual([]);
    });

    it('should use no-store cache policy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockCategories),
      });

      await categoryService.getCategories();

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs![1].cache).toBe('no-store');
    });

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(categoryService.getCategories()).rejects.toThrow(
        'Failed to load categories'
      );
    });

    it('should handle forbidden access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(categoryService.getCategories()).rejects.toThrow(
        'Failed to load categories'
      );
    });

    it('should handle malformed response data gracefully', async () => {
      const malformedData = { invalid: 'structure' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(malformedData),
      });

      const result = await categoryService.getCategories();

      // Service should return whatever the API returns, even if malformed
      expect(result).toEqual(malformedData);
    });
  });

  describe('createCategory', () => {
    const mockCreatedCategory = {
      id: 'category-4',
      name: 'New Category',
      userId: 'user-1',
    };

    it('should create category successfully', async () => {
      const categoryName = 'New Category';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockCreatedCategory),
      });

      const result = await categoryService.createCategory(categoryName);

      expect(mockFetch).toHaveBeenCalledWith('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });

      expect(result).toEqual(mockCreatedCategory);
    });

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Failed to create category');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Invalid JSON');
    });

    it('should send correct data for category creation', async () => {
      const categoryName = 'Food & Drinks';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 'category-5',
          name: categoryName,
          userId: 'user-1',
        }),
      });

      await categoryService.createCategory(categoryName);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs).toBeDefined();
      const requestBody = JSON.parse(callArgs![1].body);
      expect(requestBody).toEqual({ name: categoryName });
    });

    it('should handle empty category name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(categoryService.createCategory('')).rejects.toThrow(
        'Failed to create category'
      );
    });

    it('should handle long category names', async () => {
      const longCategoryName =
        'This is a very long category name that should be handled properly by the system';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 'category-6',
          name: longCategoryName,
          userId: 'user-1',
        }),
      });

      const result = await categoryService.createCategory(longCategoryName);

      expect(result.name).toBe(longCategoryName);
    });

    it('should handle special characters in category name', async () => {
      const specialCategoryName = 'Food & Drinks (Café/Restaurant)';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 'category-7',
          name: specialCategoryName,
          userId: 'user-1',
        }),
      });

      const result = await categoryService.createCategory(specialCategoryName);

      expect(result.name).toBe(specialCategoryName);
    });

    it('should handle duplicate category names', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
      });

      await expect(
        categoryService.createCategory('Existing Category')
      ).rejects.toThrow('Failed to create category');
    });

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Failed to create category');
    });

    it('should handle forbidden access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Failed to create category');
    });

    it('should handle server errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        categoryService.createCategory('Test Category')
      ).rejects.toThrow('Failed to create category');
    });

    it('should handle whitespace-only category names', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(categoryService.createCategory('   ')).rejects.toThrow(
        'Failed to create category'
      );
    });

    it('should preserve category name formatting', async () => {
      const categoryName = '  Food & Drinks  ';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({
          id: 'category-8',
          name: categoryName,
          userId: 'user-1',
        }),
      });

      await categoryService.createCategory(categoryName);

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs).toBeDefined();
      const requestBody = JSON.parse(callArgs![1].body);
      expect(requestBody.name).toBe(categoryName);
    });
  });
});
