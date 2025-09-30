/**
 * Financial Profile Context
 * React context for managing global financial profile state
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  FinancialProfile,
  FinancialProfileInput,
  ProfileCalculationResult
} from '@/types/financial-profile';
import {
  saveFinancialProfile,
  loadFinancialProfile,
  removeFinancialProfile,
  hasStoredFinancialProfile,
  isProfileStale
} from '@/lib/financial-profile-storage';
import {
  calculateFinancialProfile,
  validateFinancialInput
} from '@/lib/financial-profile-calculator';

interface FinancialProfileContextType {
  // Current profile state
  profile: FinancialProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Profile management
  calculateProfile: (input: FinancialProfileInput) => Promise<ProfileCalculationResult | null>;
  updateProfile: (input: FinancialProfileInput) => Promise<boolean>;
  clearProfile: () => void;
  refreshProfile: () => void;
  
  // Utility methods
  hasProfile: boolean;
  isProfileOutdated: boolean;
}

const FinancialProfileContext = createContext<FinancialProfileContextType | undefined>(undefined);

interface FinancialProfileProviderProps {
  children: React.ReactNode;
}

export function FinancialProfileProvider({ children }: FinancialProfileProviderProps) {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    const loadStoredProfile = () => {
      try {
        const storedProfile = loadFinancialProfile();
        setProfile(storedProfile);
        setError(null);
      } catch (err) {
        console.error('Error loading stored profile:', err);
        setError('Failed to load stored financial profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredProfile();
  }, []);

  // Calculate a new financial profile
  const calculateProfile = useCallback(async (
    input: FinancialProfileInput
  ): Promise<ProfileCalculationResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate input
      const validation = validateFinancialInput(input);
      if (!validation.isValid) {
        setError(`Invalid input: ${validation.errors.join(', ')}`);
        return null;
      }

      // Calculate profile
      const result = calculateFinancialProfile(input);
      
      // Save to localStorage
      const saved = saveFinancialProfile(result.profile);
      if (!saved) {
        console.warn('Failed to save profile to localStorage');
      }

      // Update state
      setProfile(result.profile);
      setError(null);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to calculate profile: ${errorMessage}`);
      console.error('Profile calculation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update existing profile with new input data
  const updateProfile = useCallback(async (input: FinancialProfileInput): Promise<boolean> => {
    const result = await calculateProfile(input);
    return result !== null;
  }, [calculateProfile]);

  // Clear the current profile
  const clearProfile = useCallback(() => {
    setProfile(null);
    setError(null);
    removeFinancialProfile();
  }, []);

  // Refresh profile from localStorage
  const refreshProfile = useCallback(() => {
    setIsLoading(true);
    try {
      const storedProfile = loadFinancialProfile();
      setProfile(storedProfile);
      setError(storedProfile ? null : 'No stored profile found');
    } catch (err) {
      console.error('Error refreshing profile:', err);
      setError('Failed to refresh profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed values
  const hasProfile = profile !== null;
  const isProfileOutdated = profile ? isProfileStale(30) : false; // 30 days

  const contextValue: FinancialProfileContextType = {
    profile,
    isLoading,
    error,
    calculateProfile,
    updateProfile,
    clearProfile,
    refreshProfile,
    hasProfile,
    isProfileOutdated
  };

  return (
    <FinancialProfileContext.Provider value={contextValue}>
      {children}
    </FinancialProfileContext.Provider>
  );
}

// Custom hook to use the financial profile context
export function useFinancialProfile(): FinancialProfileContextType {
  const context = useContext(FinancialProfileContext);
  if (context === undefined) {
    throw new Error('useFinancialProfile must be used within a FinancialProfileProvider');
  }
  return context;
}

// Hook for getting just the profile data (most common use case)
export function useProfile(): FinancialProfile | null {
  const { profile } = useFinancialProfile();
  return profile;
}

// Hook for profile status checks
export function useProfileStatus() {
  const { hasProfile, isProfileOutdated, isLoading, error } = useFinancialProfile();
  return {
    hasProfile,
    isProfileOutdated,
    isLoading,
    error,
    needsProfile: !hasProfile || isProfileOutdated
  };
}

// Utility function to check if profile exists without using React hook
export function checkStoredProfile() {
  return {
    exists: hasStoredFinancialProfile(),
    isStale: isProfileStale(30)
  };
}