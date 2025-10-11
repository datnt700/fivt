import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../../app/api/subscriptions/route';

// Mock the auth function
const mockAuth = vi.fn();
vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}));

// Mock the prisma client - declare mock functions inside vi.mock factory
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userSubscription: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    subscriptionPlan: {
      findUnique: vi.fn(),
    },
    service: {
      findUnique: vi.fn(),
    },
  },
}));

// Import after mocking
import { prisma } from '@/lib/prisma';

// Get the mocked prisma objects
const mockPrismaUserSubscription = prisma.userSubscription as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

const mockPrismaSubscriptionPlan = prisma.subscriptionPlan as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};

const mockPrismaService = prisma.service as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};

describe('/api/subscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return user subscriptions when authenticated', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-123',
          serviceId: 'service-1',
          status: 'ACTIVE',
          service: {
            id: 'service-1',
            name: 'Dashboard Service',
            type: 'DASHBOARD',
          },
        },
      ];

      mockAuth.mockResolvedValue(mockSession);
      mockPrismaUserSubscription.findMany.mockResolvedValue(mockSubscriptions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSubscriptions);
      expect(mockPrismaUserSubscription.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { service: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(mockPrismaUserSubscription.findMany).not.toHaveBeenCalled();
    });

    it('should return 401 when session has no user', async () => {
      mockAuth.mockResolvedValue({ user: null });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 401 when user has no id', async () => {
      mockAuth.mockResolvedValue({ user: {} });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockError = new Error('Database error');

      mockAuth.mockResolvedValue(mockSession);
      mockPrismaUserSubscription.findMany.mockRejectedValue(mockError);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching user subscriptions:',
        mockError
      );

      consoleSpy.mockRestore();
    });
  });

  describe('POST', () => {
    it('should subscribe to a single service', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockService = {
        id: 'service-1',
        name: 'Dashboard Service',
        type: 'DASHBOARD',
      };
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-123',
        serviceId: 'service-1',
        status: 'ACTIVE',
        service: mockService,
      };

      mockAuth.mockResolvedValue(mockSession);
      mockPrismaService.findUnique.mockResolvedValue(mockService);
      mockPrismaUserSubscription.upsert.mockResolvedValue(mockSubscription);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
        headers: { 'Content-Type': 'application/json' },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSubscription);
      expect(mockPrismaService.findUnique).toHaveBeenCalledWith({
        where: { id: 'service-1' },
      });
    });

    it('should subscribe to multiple services via plan', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockPlan = {
        id: 'plan-1',
        serviceIds: ['service-1', 'service-2'],
      };
      const mockSubscriptions = [
        { id: 'sub-1', serviceId: 'service-1', service: { id: 'service-1' } },
        { id: 'sub-2', serviceId: 'service-2', service: { id: 'service-2' } },
      ];

      mockAuth.mockResolvedValue(mockSession);
      mockPrismaSubscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaUserSubscription.upsert
        .mockResolvedValueOnce(mockSubscriptions[0])
        .mockResolvedValueOnce(mockSubscriptions[1]);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId: 'plan-1' }),
        headers: { 'Content-Type': 'application/json' },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscriptions).toHaveLength(2);
      expect(data.plan).toEqual(mockPlan);
      expect(mockPrismaUserSubscription.upsert).toHaveBeenCalledTimes(2);
    });

    it('should return 400 when neither serviceId nor planId provided', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockAuth.mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Service ID or Plan ID is required' });
    });

    it('should return 404 when service not found', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockAuth.mockResolvedValue(mockSession);
      mockPrismaService.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'non-existent' }),
        headers: { 'Content-Type': 'application/json' },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Service not found' });
    });

    it('should return 404 when plan not found', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockAuth.mockResolvedValue(mockSession);
      mockPrismaSubscriptionPlan.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId: 'non-existent' }),
        headers: { 'Content-Type': 'application/json' },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Plan not found' });
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ serviceId: 'service-1' }),
        headers: { 'Content-Type': 'application/json' },
      }) as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('DELETE', () => {
    it('should cancel subscription successfully', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockSubscription = {
        id: 'sub-1',
        userId: 'user-123',
        serviceId: 'service-1',
        status: 'CANCELLED',
        service: { id: 'service-1', name: 'Test Service' },
      };

      mockAuth.mockResolvedValue(mockSession);
      mockPrismaUserSubscription.update.mockResolvedValue(mockSubscription);

      const request = new Request(
        'http://localhost/api/subscriptions?serviceId=service-1',
        {
          method: 'DELETE',
        }
      ) as NextRequest;

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSubscription);
      expect(mockPrismaUserSubscription.update).toHaveBeenCalledWith({
        where: {
          userId_serviceId: {
            userId: 'user-123',
            serviceId: 'service-1',
          },
        },
        data: {
          status: 'CANCELLED',
          autoRenew: false,
        },
        include: {
          service: true,
        },
      });
    });

    it('should return 400 when serviceId is missing', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockAuth.mockResolvedValue(mockSession);

      const request = new Request('http://localhost/api/subscriptions', {
        method: 'DELETE',
      }) as NextRequest;

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Service ID is required' });
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request(
        'http://localhost/api/subscriptions?serviceId=service-1',
        {
          method: 'DELETE',
        }
      ) as NextRequest;

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors during deletion', async () => {
      const mockSession = { user: { id: 'user-123' } };
      const mockError = new Error('Database error');

      mockAuth.mockResolvedValue(mockSession);
      mockPrismaUserSubscription.update.mockRejectedValue(mockError);

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const request = new Request(
        'http://localhost/api/subscriptions?serviceId=service-1',
        {
          method: 'DELETE',
        }
      ) as NextRequest;

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error unsubscribing from service:',
        mockError
      );

      consoleSpy.mockRestore();
    });
  });
});
