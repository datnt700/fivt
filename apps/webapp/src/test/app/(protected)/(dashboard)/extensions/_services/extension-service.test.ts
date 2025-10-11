import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extensionService } from '@/app/(protected)/(dashboard)/extensions/_services/extension-service';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Extension Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserExtensions', () => {
    it('should fetch user extensions successfully', async () => {
      const mockSubscriptions = [
        {
          id: '1',
          userId: 'user1',
          serviceId: 'service1',
          status: 'ACTIVE',
          startDate: '2023-10-10',
          endDate: null,
          autoRenew: true,
          service: {
            id: 'service1',
            name: 'Dashboard Service',
            type: 'DASHBOARD',
            price: 9.99,
            features: ['Analytics'],
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ subscriptions: mockSubscriptions }),
      });

      const result = await extensionService.getUserExtensions();

      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions');
      expect(result).toEqual(mockSubscriptions);
    });

    it('should return empty array when no subscriptions in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await extensionService.getUserExtensions();

      expect(result).toEqual([]);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(extensionService.getUserExtensions()).rejects.toThrow(
        'Failed to fetch user extensions'
      );
    });
  });

  describe('getExtensionServices', () => {
    it('should fetch services successfully', async () => {
      const mockServices = [
        {
          id: 'service1',
          name: 'Dashboard Service',
          type: 'DASHBOARD',
          price: 9.99,
          features: ['Analytics'],
          isActive: true,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      });

      const result = await extensionService.getExtensionServices();

      expect(mockFetch).toHaveBeenCalledWith('/api/services');
      expect(result).toEqual(mockServices);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(extensionService.getExtensionServices()).rejects.toThrow(
        'Failed to fetch extension services'
      );
    });
  });

  describe('getExtensionPlans', () => {
    it('should fetch subscription plans successfully', async () => {
      const mockPlans = [
        {
          id: 'plan1',
          name: 'Basic Plan',
          description: 'Basic features',
          price: 19.99,
          billingInterval: 'MONTHLY',
          features: ['Dashboard', 'Basic Analytics'],
          serviceIds: ['service1'],
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlans,
      });

      const result = await extensionService.getExtensionPlans();

      expect(mockFetch).toHaveBeenCalledWith('/api/subscription-plans');
      expect(result).toEqual(mockPlans);
    });

    it('should throw error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(extensionService.getExtensionPlans()).rejects.toThrow(
        'Failed to fetch extension plans'
      );
    });
  });

  describe('installExtension', () => {
    it('should subscribe to service successfully', async () => {
      const mockResponse = { success: true, subscriptionId: 'sub1' };
      const params = { serviceId: 'service1' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await extensionService.installExtension(params);

      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should subscribe to plan successfully', async () => {
      const mockResponse = { success: true, subscriptionId: 'sub1' };
      const params = { planId: 'plan1' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await extensionService.installExtension(params);

      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when subscription fails', async () => {
      const params = { serviceId: 'service1' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(extensionService.installExtension(params)).rejects.toThrow(
        'Failed to install extension'
      );
    });
  });

  describe('uninstallExtension', () => {
    it('should unsubscribe from service successfully', async () => {
      const mockResponse = { success: true };
      const serviceId = 'service1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await extensionService.uninstallExtension(serviceId);

      expect(mockFetch).toHaveBeenCalledWith(
        `/api/subscriptions?serviceId=${serviceId}`,
        {
          method: 'DELETE',
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when unsubscribe fails', async () => {
      const serviceId = 'service1';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        extensionService.uninstallExtension(serviceId)
      ).rejects.toThrow('Failed to uninstall extension');
    });
  });
});
