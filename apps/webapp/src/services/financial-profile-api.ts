/**
 * Financial Profile API Service
 * Client-side service for interacting with the financial profile API
 */

import {
  FinancialProfile,
  FinancialProfileInput
} from '@/types/financial-profile';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
}

export interface ProfileResponse {
  profile: FinancialProfile;
  insights: string[];
  recommendations: string[];
  calculatedAt: string;
  source?: string;
  message?: string;
}

/**
 * Get the current user's financial profile from the API
 */
export async function getFinancialProfile(): Promise<ApiResponse<ProfileResponse>> {
  try {
    const response = await fetch('/api/financial-profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to fetch financial profile'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Create or update the user's financial profile
 */
export async function createFinancialProfile(
  input: FinancialProfileInput
): Promise<ApiResponse<ProfileResponse>> {
  try {
    const response = await fetch('/api/financial-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create financial profile',
        details: data.details
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Delete the user's financial profile
 */
export async function deleteFinancialProfile(): Promise<ApiResponse<{ message: string }>> {
  try {
    const response = await fetch('/api/financial-profile', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to delete financial profile'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Recalculate profile using existing user data
 */
export async function recalculateFinancialProfile(): Promise<ApiResponse<ProfileResponse>> {
  try {
    const response = await fetch('/api/financial-profile/recalculate', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to recalculate financial profile'
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * React Query hook for fetching financial profile
 */
export const FINANCIAL_PROFILE_QUERY_KEY = ['financial-profile'];

export function useFinancialProfileQuery() {
  // This can be used with React Query later
  return {
    queryKey: FINANCIAL_PROFILE_QUERY_KEY,
    queryFn: getFinancialProfile,
  };
}