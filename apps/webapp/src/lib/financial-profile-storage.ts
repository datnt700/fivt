/**
 * Financial Profile Storage Utilities
 * Handles saving/loading financial profiles to/from localStorage
 */

import {
  FinancialProfile,
  FINANCIAL_PROFILE_STORAGE_KEY
} from '@/types/financial-profile';

/**
 * Save financial profile to localStorage
 */
export function saveFinancialProfile(profile: FinancialProfile): boolean {
  try {
    if (typeof window === 'undefined') {
      // Server-side rendering - can't access localStorage
      return false;
    }
    
    const serialized = JSON.stringify(profile);
    localStorage.setItem(FINANCIAL_PROFILE_STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save financial profile to localStorage:', error);
    return false;
  }
}

/**
 * Load financial profile from localStorage
 */
export function loadFinancialProfile(): FinancialProfile | null {
  try {
    if (typeof window === 'undefined') {
      // Server-side rendering - can't access localStorage
      return null;
    }
    
    const stored = localStorage.getItem(FINANCIAL_PROFILE_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const profile = JSON.parse(stored) as FinancialProfile;
    
    // Validate the loaded profile has required structure
    if (!isValidFinancialProfile(profile)) {
      console.warn('Invalid financial profile found in localStorage, removing...');
      removeFinancialProfile();
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Failed to load financial profile from localStorage:', error);
    // Clean up corrupted data
    removeFinancialProfile();
    return null;
  }
}

/**
 * Remove financial profile from localStorage
 */
export function removeFinancialProfile(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    localStorage.removeItem(FINANCIAL_PROFILE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to remove financial profile from localStorage:', error);
    return false;
  }
}

/**
 * Check if financial profile exists in localStorage
 */
export function hasStoredFinancialProfile(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return localStorage.getItem(FINANCIAL_PROFILE_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Validate that an object is a valid financial profile
 */
function isValidFinancialProfile(obj: unknown): obj is FinancialProfile {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const profile = obj as Record<string, unknown>;
  
  // Check required top-level properties
  const requiredProps = [
    'stage', 'category', 'income', 'expenses', 
    'investments', 'netWorth', 'age', 'metrics', 'lastUpdated'
  ];
  
  for (const prop of requiredProps) {
    if (!(prop in profile)) {
      return false;
    }
  }
  
  // Check income structure
  const income = profile.income;
  if (!income || typeof income !== 'object' || income === null) {
    return false;
  }
  const incomeObj = income as Record<string, unknown>;
  if (typeof incomeObj.gross !== 'number' || typeof incomeObj.net !== 'number') {
    return false;
  }
  
  // Check expenses structure
  const expenses = profile.expenses;
  if (!expenses || typeof expenses !== 'object' || expenses === null) {
    return false;
  }
  const expensesObj = expenses as Record<string, unknown>;
  if (typeof expensesObj.annual !== 'number' || typeof expensesObj.monthly !== 'number') {
    return false;
  }
  
  // Check investments structure
  const investments = profile.investments;
  if (!investments || typeof investments !== 'object' || investments === null) {
    return false;
  }
  const investmentsObj = investments as Record<string, unknown>;
  if (typeof investmentsObj.annual !== 'number') {
    return false;
  }
  
  // Check metrics structure
  const metrics = profile.metrics;
  if (!metrics || typeof metrics !== 'object' || metrics === null) {
    return false;
  }
  const metricsObj = metrics as Record<string, unknown>;
  if (typeof metricsObj.savingsRate !== 'number' ||
      typeof metricsObj.fiNumber !== 'number' ||
      typeof metricsObj.progressToFI !== 'number' ||
      typeof metricsObj.yearsToFI !== 'number') {
    return false;
  }
  
  // Check basic types
  if (typeof profile.netWorth !== 'number' ||
      typeof profile.age !== 'number' ||
      typeof profile.stage !== 'string' ||
      typeof profile.category !== 'string' ||
      typeof profile.lastUpdated !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Get the age of the stored financial profile in days
 */
export function getProfileAge(): number | null {
  const profile = loadFinancialProfile();
  if (!profile) {
    return null;
  }
  
  try {
    const lastUpdated = new Date(profile.lastUpdated);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
}

/**
 * Check if the stored profile is stale (older than specified days)
 */
export function isProfileStale(maxDays: number = 30): boolean {
  const age = getProfileAge();
  if (age === null) {
    return true; // No profile is considered stale
  }
  return age > maxDays;
}