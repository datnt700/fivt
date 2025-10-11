import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../app/api/services/route';

// Mock the prisma client - declare mock functions inside vi.mock factory
vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findMany: vi.fn(),
    },
  },
}));

// Import after mocking
import { prisma } from '@/lib/prisma';

// Get the mocked prisma service
const mockPrismaService = prisma.service as unknown as {
  findMany: ReturnType<typeof vi.fn>;
};

describe('/api/services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all active services', async () => {
      const mockServices = [
        {
          id: 'service-1',
          name: 'Dashboard Service',
          description: 'Comprehensive dashboard',
          type: 'DASHBOARD',
          price: 9.99,
          isActive: true,
          features: ['Analytics', 'Reporting'],
        },
        {
          id: 'service-2',
          name: 'Budget Service',
          description: 'Budget tracking',
          type: 'BUDGET_TRACKING',
          price: 14.99,
          isActive: true,
          features: ['Budget alerts', 'Spending insights'],
        },
      ];

      mockPrismaService.findMany.mockResolvedValue(mockServices);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockServices);
      expect(mockPrismaService.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      mockPrismaService.findMany.mockRejectedValue(mockError);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching services:',
        mockError
      );

      consoleSpy.mockRestore();
    });

    it('should return empty array when no services exist', async () => {
      mockPrismaService.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should only return active services', async () => {
      const mockServices = [
        {
          id: 'service-1',
          name: 'Active Service',
          isActive: true,
        },
      ];

      mockPrismaService.findMany.mockResolvedValue(mockServices);

      await GET();

      expect(mockPrismaService.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('should order services by name in ascending order', async () => {
      const mockServices = [
        { id: 'service-1', name: 'A Service', isActive: true },
        { id: 'service-2', name: 'B Service', isActive: true },
      ];

      mockPrismaService.findMany.mockResolvedValue(mockServices);

      await GET();

      expect(mockPrismaService.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    });
  });
});
