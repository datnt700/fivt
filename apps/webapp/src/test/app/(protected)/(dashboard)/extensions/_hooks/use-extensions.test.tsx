import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import {
  useServices,
  useUserSubscriptions,
  useSubscriptionPlans,
  useServiceAccess,
  useAccessibleServices,
  useSubscribeToService,
  useUnsubscribeFromService,
} from '../../../../../../app/(protected)/(dashboard)/extensions/_hooks/use-extensions';

// Mock next-auth
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';

  return Wrapper;
}

describe('Extension Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-123' } },
    });
  });

  describe('useUserSubscriptions', () => {
    it('should fetch user subscriptions when authenticated', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-123',
          serviceId: 'service-1',
          status: 'ACTIVE',
          service: {
            id: 'service-1',
            name: 'Test Service',
            type: 'DASHBOARD',
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptions,
      });

      const { result } = renderHook(() => useUserSubscriptions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions');
      expect(result.current.data).toEqual(mockSubscriptions);
    });

    it('should return undefined data when not authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: null,
      });

      const { result } = renderHook(() => useUserSubscriptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useUserSubscriptions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useServices', () => {
    it('should fetch all available services', async () => {
      const mockServices = [
        {
          id: 'service-1',
          name: 'Dashboard Service',
          type: 'DASHBOARD',
          price: 9.99,
          isActive: true,
          features: ['Analytics'],
        },
        {
          id: 'service-2',
          name: 'Budget Service',
          type: 'BUDGET_TRACKING',
          price: 14.99,
          isActive: true,
          features: ['Budget tracking'],
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      });

      const { result } = renderHook(() => useServices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/services');
      expect(result.current.data).toEqual(mockServices);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useServices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useSubscriptionPlans', () => {
    it('should fetch subscription plans', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          name: 'Basic Plan',
          price: 19.99,
          serviceIds: ['service-1'],
          isActive: true,
          features: ['Basic features'],
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlans,
      });

      const { result } = renderHook(() => useSubscriptionPlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/subscription-plans');
      expect(result.current.data).toEqual(mockPlans);
    });
  });

  describe('useServiceAccess', () => {
    it('should return true when user has active subscription', async () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptions,
      });

      const { result } = renderHook(() => useServiceAccess('DASHBOARD'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(true);
      });

      expect(result.current.subscription).toEqual(mockSubscriptions[0]);
    });

    it('should return false when user has no subscription', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const { result } = renderHook(() => useServiceAccess('DASHBOARD'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });

      expect(result.current.subscription).toBeUndefined();
    });

    it('should return false when subscription is not active', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-123',
          serviceId: 'service-1',
          status: 'CANCELLED',
          service: {
            id: 'service-1',
            name: 'Dashboard Service',
            type: 'DASHBOARD',
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptions,
      });

      const { result } = renderHook(() => useServiceAccess('DASHBOARD'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });

    it('should return false when subscription is expired', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: 'user-123',
          serviceId: 'service-1',
          status: 'ACTIVE',
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          service: {
            id: 'service-1',
            name: 'Dashboard Service',
            type: 'DASHBOARD',
          },
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptions,
      });

      const { result } = renderHook(() => useServiceAccess('DASHBOARD'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasAccess).toBe(false);
      });
    });
  });

  describe('useAccessibleServices', () => {
    it('should return accessible service types', async () => {
      // Mock subscriptions response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
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
          {
            id: 'sub-2',
            userId: 'user-123',
            serviceId: 'service-2',
            status: 'CANCELLED',
            service: {
              id: 'service-2',
              name: 'Budget Service',
              type: 'BUDGET_TRACKING',
            },
          },
        ],
      });

      const { result } = renderHook(() => useAccessibleServices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current).toEqual(['DASHBOARD']);
      });

      expect(result.current).toHaveLength(1);
      expect(result.current).toContain('DASHBOARD');
      expect(result.current).not.toContain('BUDGET_TRACKING');
    });
  });

  describe('useSubscribeToService', () => {
    it('should call install extension API', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSubscribeToService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ serviceId: 'service-1' });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceId: 'service-1' }),
        });
      });
    });

    it('should handle subscription errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const { result } = renderHook(() => useSubscribeToService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ serviceId: 'service-1' });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('useUnsubscribeFromService', () => {
    it('should call uninstall extension API', async () => {
      const mockResponse = { success: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useUnsubscribeFromService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('service-1');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/subscriptions?serviceId=service-1',
          {
            method: 'DELETE',
          }
        );
      });
    });

    it('should handle unsubscribe errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const { result } = renderHook(() => useUnsubscribeFromService(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('service-1');

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('Query invalidation', () => {
    it('should invalidate queries on successful subscription', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useSubscribeToService(), { wrapper });

      result.current.mutate({ serviceId: 'service-1' });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['user-extensions'],
        });
        expect(refetchQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['user-extensions', 'user-123'],
        });
      });
    });

    it('should invalidate queries on successful unsubscription', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => useUnsubscribeFromService(), {
        wrapper,
      });

      result.current.mutate('service-1');

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['user-extensions'],
        });
        expect(refetchQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['user-extensions', 'user-123'],
        });
      });
    });
  });
});
