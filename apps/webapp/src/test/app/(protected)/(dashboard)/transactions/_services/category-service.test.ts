import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { categoryService } from '@/app/(protected)/(dashboard)/transactions/_services/category-service';
import type { Category } from '@prisma/client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Category Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCategories', () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Food & Dining' },
      { id: 'cat-2', name: 'Transportation' },
      { id: 'cat-3', name: 'Entertainment' },
      { id: 'cat-4', name: 'Salary' },
      { id: 'cat-5', name: 'Investment Returns' },
    ];

    it('should fetch categories successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories),
      });

      const result = await categoryService.getCategories();

      expect(mockFetch).toHaveBeenCalledWith('/api/category', { 
        cache: 'no-store' 
      });

      expect(result).toEqual(mockCategories);
      expect(result).toHaveLength(5);
    });

    it('should return empty array when no categories exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await categoryService.getCategories();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(categoryService.getCategories())
        .rejects.toThrow('Failed to load categories');
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(categoryService.getCategories())
        .rejects.toThrow('Failed to load categories');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(categoryService.getCategories())
        .rejects.toThrow('Failed to fetch');
    });

    it('should always use no-store cache policy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories),
      });

      await categoryService.getCategories();

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('/api/category');
      expect(options.cache).toBe('no-store');
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Unexpected token')),
      });

      await expect(categoryService.getCategories())
        .rejects.toThrow('Unexpected token');
    });

    it('should handle categories with special characters', async () => {
      const specialCategories = [
        { id: 'cat-1', name: 'Café & Restaurants' },
        { id: 'cat-2', name: 'Health & Médical' },
        { id: 'cat-3', name: 'Épargne & Investissement' },
        { id: 'cat-4', name: 'Taxes & Impôts' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(specialCategories),
      });

      const result = await categoryService.getCategories();

      expect(result).toEqual(specialCategories);
      expect(result).toHaveLength(4);
      expect(result[0]?.name).toBe('Café & Restaurants');
    });

    it('should handle very long category names', async () => {
      const longNameCategory = {
        id: 'cat-long',
        name: 'This is a very long category name that might test the limits of what the system can handle for category naming conventions and display purposes',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([longNameCategory]),
      });

      const result = await categoryService.getCategories();

      expect(result).toEqual([longNameCategory]);
      expect(result).toHaveLength(1);
      expect(result[0]?.name.length).toBeGreaterThan(100);
    });

    it('should handle duplicate category names gracefully', async () => {
      const categoriesWithDuplicates = [
        { id: 'cat-1', name: 'Food' },
        { id: 'cat-2', name: 'Food' },
        { id: 'cat-3', name: 'Transport' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(categoriesWithDuplicates),
      });

      const result = await categoryService.getCategories();

      expect(result).toEqual(categoriesWithDuplicates);
      expect(result[0]?.name).toBe(result[1]?.name);
      expect(result[0]?.id).not.toBe(result[1]?.id);
    });
  });

  describe('createCategory', () => {
    const mockCreatedCategory: Category = {
      id: 'cat-new-123',
      name: 'New Category',
      userId: 'user-123',
    };

    it('should create category successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedCategory),
      });

      const result = await categoryService.createCategory('New Category');

      expect(mockFetch).toHaveBeenCalledWith('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Category' }),
      });

      expect(result).toEqual(mockCreatedCategory);
    });

    it('should handle category names with special characters', async () => {
      const specialNameCategory = {
        ...mockCreatedCategory,
        name: 'Café & Restaurants',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(specialNameCategory),
      });

      const result = await categoryService.createCategory('Café & Restaurants');

      expect(result.name).toBe('Café & Restaurants');
      expect(mockFetch).toHaveBeenCalledWith('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Café & Restaurants' }),
      });
    });

    it('should handle empty category name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Category name is required' }),
      });

      await expect(categoryService.createCategory(''))
        .rejects.toThrow('Failed to create category');
    });

    it('should handle whitespace-only category name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Category name cannot be empty' }),
      });

      await expect(categoryService.createCategory('   '))
        .rejects.toThrow('Failed to create category');
    });

    it('should handle duplicate category name error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'Category already exists' }),
      });

      await expect(categoryService.createCategory('Existing Category'))
        .rejects.toThrow('Failed to create category');
    });

    it('should handle unauthorized creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(categoryService.createCategory('New Category'))
        .rejects.toThrow('Failed to create category');
    });

    it('should handle server errors during creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(categoryService.createCategory('New Category'))
        .rejects.toThrow('Failed to create category');
    });

    it('should handle network errors during creation', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection timeout'));

      await expect(categoryService.createCategory('New Category'))
        .rejects.toThrow('Connection timeout');
    });

    it('should send correct request format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCreatedCategory),
      });

      await categoryService.createCategory('Test Category');

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];

      expect(url).toBe('/api/category');
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(JSON.parse(options.body as string)).toEqual({ name: 'Test Category' });
    });

    it('should handle very long category names', async () => {
      const longName = 'A'.repeat(200);
      const longNameCategory = {
        ...mockCreatedCategory,
        name: longName,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(longNameCategory),
      });

      const result = await categoryService.createCategory(longName);

      expect(result.name).toBe(longName);
      expect(result.name.length).toBe(200);
    });

    it('should handle category names with numbers and symbols', async () => {
      const specialName = '2024 Tax & Legal #1';
      const specialCategory = {
        ...mockCreatedCategory,
        name: specialName,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(specialCategory),
      });

      const result = await categoryService.createCategory(specialName);

      expect(result.name).toBe(specialName);
    });

    it('should handle JSON parsing errors in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON format')),
      });

      await expect(categoryService.createCategory('New Category'))
        .rejects.toThrow('Invalid JSON format');
    });
  });

  describe('Service Integration', () => {
    it('should handle create then fetch workflow', async () => {
      const newCategoryName = 'Travel Expenses';
      const createdCategory: Category = {
        id: 'cat-travel',
        name: newCategoryName,
        userId: 'user-123',
      };

      // Mock create category
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdCategory),
      });

      // Create category
      const createResult = await categoryService.createCategory(newCategoryName);
      expect(createResult).toEqual(createdCategory);

      // Mock fetch categories including the new one
      const allCategories = [
        { id: 'cat-1', name: 'Food' },
        { id: 'cat-travel', name: newCategoryName },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(allCategories),
      });

      // Fetch all categories
      const fetchResult = await categoryService.getCategories();
      expect(fetchResult).toEqual(allCategories);
      expect(fetchResult.some(cat => cat.name === newCategoryName)).toBe(true);

      // Verify both API calls
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent category operations', async () => {
      // Mock responses for concurrent requests
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'cat-new', name: 'New Category' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ id: 'cat-existing', name: 'Existing' }]),
        });

      // Make concurrent requests
      const [createResult, fetchResult] = await Promise.all([
        categoryService.createCategory('New Category'),
        categoryService.getCategories(),
      ]);

      expect(createResult.name).toBe('New Category');
      expect(fetchResult).toEqual([{ id: 'cat-existing', name: 'Existing' }]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple category creations in sequence', async () => {
      const categoryNames = ['Food', 'Transport', 'Entertainment'];
      const createdCategories: Category[] = [];

      for (let i = 0; i < categoryNames.length; i++) {
        const categoryName = categoryNames[i];
        if (!categoryName) continue;
        
        const category: Category = {
          id: `cat-${i + 1}`,
          name: categoryName,
          userId: 'user-123',
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(category),
        });

        const result = await categoryService.createCategory(categoryName);
        createdCategories.push(result);
      }

      expect(createdCategories).toHaveLength(3);
      expect(createdCategories.map(c => c.name)).toEqual(categoryNames);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Recovery', () => {
    it('should handle intermittent network failures', async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(categoryService.getCategories())
        .rejects.toThrow('Network timeout');

      // Second call succeeds
      const categories = [{ id: 'cat-1', name: 'Food' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(categories),
      });

      const result = await categoryService.getCategories();
      expect(result).toEqual(categories);
    });

    it('should handle server recovery after error', async () => {
      // First creation fails with server error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(categoryService.createCategory('New Category'))
        .rejects.toThrow('Failed to create category');

      // Second creation succeeds
      const newCategory: Category = {
        id: 'cat-recovered',
        name: 'Recovered Category',
        userId: 'user-123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newCategory),
      });

      const result = await categoryService.createCategory('Recovered Category');
      expect(result).toEqual(newCategory);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const result = await categoryService.getCategories();
      expect(result).toBeNull();
    });

    it('should handle undefined response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(undefined),
      });

      const result = await categoryService.getCategories();
      expect(result).toBeUndefined();
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String exception');

      await expect(categoryService.getCategories())
        .rejects.toBe('String exception');
    });

    it('should handle response with unexpected structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ unexpected: 'structure' }),
      });

      const result = await categoryService.getCategories();
      expect(result).toEqual({ unexpected: 'structure' });
    });
  });
});