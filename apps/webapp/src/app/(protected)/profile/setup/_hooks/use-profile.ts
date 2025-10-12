/**
 * Financial Profile React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createFinancialProfile, getFinancialProfile, type ProfileApiResponse } from '../_services/profile-service';
import { FLAT_ROUTES } from '@/config/routes';

// Query keys
export const PROFILE_KEYS = {
  all: ['profile'] as const,
  profile: () => [...PROFILE_KEYS.all, 'current'] as const,
} as const;

/**
 * Hook to fetch user's financial profile
 */
export function useProfileQuery() {
  return useQuery({
    queryKey: PROFILE_KEYS.profile(),
    queryFn: getFinancialProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if user hasn't completed profile (404)
      if (error && error.message.includes('Profile not found')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Hook to create financial profile with navigation to results
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createFinancialProfile,
    onSuccess: (data: ProfileApiResponse) => {
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all });
      
      if (data.success && data.profile) {
        // Update the profile cache
        queryClient.setQueryData(PROFILE_KEYS.profile(), data);
        
        // Navigate to results page with the profile data
        router.push(FLAT_ROUTES.PROFILE_RESULTS);
      }
    },
    onError: (error) => {
      console.error('Failed to create financial profile:', error);
    }
  });
}

/**
 * Hook to get profile loading state
 */
export function useProfileState() {
  const { data, isLoading, isError, error } = useProfileQuery();
  
  return {
    isLoading,
    isError,
    error,
    hasProfile: data?.success === true,
    profile: data?.success ? data.profile : null,
    needsSetup: !data?.success || isError
  };
}