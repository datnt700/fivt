/**
 * Financial Profile API Services
 */

import { FinancialProfileInput } from '@/types/financial-profile';

export interface ProfileApiResponse {
  success: boolean;
  profile?: {
    stage: string;
    category: string;
    income: { gross: number; net: number };
    expenses: { annual: number; monthly: number };
    investments: { annual: number };
    netWorth: number;
    age: number;
    metrics: {
      savingsRate: number;
      fiNumber: number;
      progressToFI: number;
      yearsToFI: number;
    };
    lastUpdated: string;
  };
  insights?: string[];
  recommendations?: string[];
  calculatedAt?: string;
  message?: string;
  error?: string;
  details?: string[];
}

export async function createFinancialProfile(input: FinancialProfileInput): Promise<ProfileApiResponse> {
  const response = await fetch('/api/financial-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create financial profile');
  }

  return data;
}

export async function getFinancialProfile(): Promise<ProfileApiResponse> {
  const response = await fetch('/api/financial-profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      // User hasn't completed profile setup
      return { success: false, error: 'Profile not found' };
    }
    throw new Error(data.error || 'Failed to fetch financial profile');
  }

  return data;
}