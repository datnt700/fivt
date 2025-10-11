import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { extensionService } from '../_services/extension-service';
import type { ServiceType } from '@/hooks/use-subscriptions';

/**
 * Hook to get user's active extensions
 */
export function useUserSubscriptions() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['user-extensions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      return extensionService.getUserExtensions();
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get all available extension services
 */
export function useServices() {
  return useQuery({
    queryKey: ['extension-services'],
    queryFn: async () => extensionService.getExtensionServices(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get all extension plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['extension-plans'],
    queryFn: async () => extensionService.getExtensionPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check if user has access to a specific service type
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
 * Hook to get services that user can access
 */
export function useAccessibleServices() {
  const { data: subscriptions } = useUserSubscriptions();

  const accessibleServiceTypes =
    subscriptions
      ?.filter(
        sub =>
          sub.status === 'ACTIVE' &&
          (!sub.endDate || new Date(sub.endDate) > new Date())
      )
      .map(sub => sub.service.type) ?? [];

  return accessibleServiceTypes;
}

/**
 * Hook to install an extension or plan
 */
export function useSubscribeToService() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (params: { serviceId?: string; planId?: string }) =>
      extensionService.installExtension(params),
    onSuccess: () => {
      // Invalidate and refetch extension data immediately
      queryClient.invalidateQueries({
        queryKey: ['user-extensions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['extension-services'],
      });
      // Force refetch
      queryClient.refetchQueries({
        queryKey: ['user-extensions', session?.user?.id],
      });
    },
  });
}

/**
 * Hook to uninstall an extension
 */
export function useUnsubscribeFromService() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: (serviceId: string) =>
      extensionService.uninstallExtension(serviceId),
    onSuccess: () => {
      // Invalidate and refetch extension data immediately
      queryClient.invalidateQueries({
        queryKey: ['user-extensions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['extension-services'],
      });
      // Force refetch
      queryClient.refetchQueries({
        queryKey: ['user-extensions', session?.user?.id],
      });
    },
  });
}
