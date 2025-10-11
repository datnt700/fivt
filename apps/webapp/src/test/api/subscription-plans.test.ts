import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../app/api/subscription-plans/route';

// Mock the prisma client - declare mock functions inside vi.mock factory
vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscriptionPlan: {
      findMany: vi.fn(),
    },
  },
}));

// Import after mocking
import { prisma } from '@/lib/prisma';

// Get the mocked prisma subscription plan
const mockPrismaSubscriptionPlan = prisma.subscriptionPlan as unknown as {
  findMany: ReturnType<typeof vi.fn>;
};

describe('/api/subscription-plans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return all active subscription plans', async () => {
      const mockPlans = [
        {
          id: 'plan-basic',
          name: 'Basic Plan',
          description: 'Essential financial tools',
          price: 19.99,
          billingInterval: 'MONTHLY',
          serviceIds: ['service-1', 'service-2'],
          isActive: true,
          features: ['Dashboard', 'Basic analytics'],
        },
        {
          id: 'plan-premium',
          name: 'Premium Plan',
          description: 'Advanced financial management',
          price: 39.99,
          billingInterval: 'MONTHLY',
          serviceIds: ['service-1', 'service-2', 'service-3'],
          isActive: true,
          features: ['All Basic features', 'AI assistant'],
        },
      ];

      mockPrismaSubscriptionPlan.findMany.mockResolvedValue(mockPlans);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPlans);
      expect(mockPrismaSubscriptionPlan.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      });
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database connection failed');
      mockPrismaSubscriptionPlan.findMany.mockRejectedValue(mockError);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching subscription plans:',
        mockError
      );

      consoleSpy.mockRestore();
    });

    it('should return empty array when no plans exist', async () => {
      mockPrismaSubscriptionPlan.findMany.mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should order plans by price in ascending order', async () => {
      const mockPlans = [
        { id: 'plan-1', name: 'Cheap Plan', price: 10.0, isActive: true },
        { id: 'plan-2', name: 'Expensive Plan', price: 50.0, isActive: true },
      ];

      mockPrismaSubscriptionPlan.findMany.mockResolvedValue(mockPlans);

      await GET();

      expect(mockPrismaSubscriptionPlan.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      });
    });

    it('should only return active plans', async () => {
      const mockPlans = [{ id: 'plan-1', name: 'Active Plan', isActive: true }];

      mockPrismaSubscriptionPlan.findMany.mockResolvedValue(mockPlans);

      await GET();

      expect(mockPrismaSubscriptionPlan.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        orderBy: {
          price: 'asc',
        },
      });
    });
  });
});
