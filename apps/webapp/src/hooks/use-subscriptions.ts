'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// Types for the subscription system
export type ServiceType =
  | 'DASHBOARD'
  | 'BUDGET_TRACKING'
  | 'TRANSACTION_MANAGEMENT'
  | 'BANKING_INTEGRATION'
  | 'AI_CHATBOT';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: ServiceType;
  price: number;
  isActive: boolean;
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  serviceId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  service: Service;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingInterval: string;
  serviceIds: string[];
  isActive: boolean;
  maxUsers?: number;
  features: string[];
}

/**
 * Hook to get user's active subscriptions
 */
export function useUserSubscriptions() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-subscriptions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const response = await fetch('/api/subscriptions/user');
      if (!response.ok) throw new Error('Failed to fetch subscriptions');

      return (await response.json()) as UserSubscription[];
    },
    enabled: !!session?.user?.id,
  });
}

/**
 * Hook to get all available services
 */
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');

      return (await response.json()) as Service[];
    },
  });
}

/**
 * Hook to get all subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch plans');

      return (await response.json()) as SubscriptionPlan[];
    },
  });
}

/**
 * Hook to check if user has access to a specific service
 */
export function useServiceAccess(serviceType: ServiceType) {
  const { data: subscriptions } = useUserSubscriptions();

  return {
    hasAccess:
      subscriptions?.some(
        sub =>
          sub.service.type === serviceType &&
          sub.status === 'ACTIVE' &&
          (!sub.endDate || new Date(sub.endDate) > new Date())
      ) ?? false,
    subscription: subscriptions?.find(sub => sub.service.type === serviceType),
  };
}

/**
 * Hook to subscribe to a service
 */
export function useSubscribeToService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      planId,
    }: {
      serviceId?: string;
      planId?: string;
    }) => {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, planId }),
      });

      if (!response.ok) throw new Error('Failed to subscribe');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });
}

/**
 * Hook to unsubscribe from a service
 */
export function useUnsubscribeFromService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch('/api/subscriptions/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });

      if (!response.ok) throw new Error('Failed to unsubscribe');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
    },
  });
}

/**
 * Hook to get services user has access to
 */
export function useAccessibleServices() {
  const { data: subscriptions, isLoading } = useUserSubscriptions();

  const accessibleServices =
    subscriptions
      ?.filter(
        sub =>
          sub.status === 'ACTIVE' &&
          (!sub.endDate || new Date(sub.endDate) > new Date())
      )
      .map(sub => sub.service) ?? [];

  return {
    services: accessibleServices,
    isLoading,
    hasService: (serviceType: ServiceType) =>
      accessibleServices.some(service => service.type === serviceType),
  };
}
