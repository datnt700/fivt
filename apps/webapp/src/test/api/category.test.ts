import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/category/route';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe('/api/category GET route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return categories successfully', async () => {
    const { prisma } = await import('@/lib/prisma');
    const mockCategories = [
      { id: '1', name: 'Food', userId: 'user-123' },
      { id: '2', name: 'Transport', userId: 'user-456' },
    ];

    vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockCategories);
    expect(prisma.category.findMany).toHaveBeenCalledWith({});
  });

  it('should handle database errors', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.category.findMany).mockRejectedValue(new Error('Database error'));

    await expect(GET()).rejects.toThrow('Database error');
    expect(prisma.category.findMany).toHaveBeenCalledWith({});
  });

  it('should return empty array when no categories exist', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
    expect(prisma.category.findMany).toHaveBeenCalledWith({});
  });
});