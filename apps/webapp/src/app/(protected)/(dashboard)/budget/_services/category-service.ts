import type { Category } from '@prisma/client';

export const categoryService = {
  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch('/api/category', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error('Failed to load categories');
    }

    return response.json();
  },

  async createCategory(name: string): Promise<Category> {
    const response = await fetch('/api/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create category');
    }

    return response.json();
  },
};
