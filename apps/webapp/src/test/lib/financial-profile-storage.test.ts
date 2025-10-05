import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  saveFinancialProfile,
  loadFinancialProfile,
  removeFinancialProfile,
  hasStoredFinancialProfile,
  getProfileAge,
  isProfileStale
} from '@/lib/financial-profile-storage';
import type { FinancialProfile } from '@/types/financial-profile';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Financial Profile Storage', () => {
  const mockProfile: FinancialProfile = {
    stage: 'Growth',
    category: 'FIRE',
    income: { gross: 100000, net: 75000 },
    expenses: { annual: 50000, monthly: 4167 },
    investments: { annual: 15000, monthly: 1250 },
    netWorth: 200000,
    age: 30,
    debt: 25000,
    metrics: {
      savingsRate: 0.33,
      fiNumber: 1250000,
      progressToFI: 0.16,
      yearsToFI: 20
    },
    lastUpdated: '2025-10-05T12:00:00.000Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window as defined
    Object.defineProperty(global, 'window', {
      value: { localStorage: mockLocalStorage },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('saveFinancialProfile', () => {
    it('should save profile to localStorage successfully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      
      const result = saveFinancialProfile(mockProfile);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'fivt_financial_profile',
        JSON.stringify(mockProfile)
      );
    });

    it('should return false when localStorage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = saveFinancialProfile(mockProfile);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return false on server-side (no window)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - temporarily remove window for SSR simulation
      global.window = undefined;
      
      const result = saveFinancialProfile(mockProfile);
      
      expect(result).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('loadFinancialProfile', () => {
    it('should load valid profile from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProfile));
      
      const result = loadFinancialProfile();
      
      expect(result).toEqual(mockProfile);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('fivt_financial_profile');
    });

    it('should return null when no profile stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = loadFinancialProfile();
      
      expect(result).toBe(null);
    });

    it('should return null for invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = loadFinancialProfile();
      
      expect(result).toBe(null);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return null on server-side (no window)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - temporarily remove window for SSR simulation
      global.window = undefined;
      
      const result = loadFinancialProfile();
      
      expect(result).toBe(null);
      
      // Restore window
      global.window = originalWindow;
    });

    it('should handle localStorage access errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = loadFinancialProfile();
      
      expect(result).toBe(null);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeFinancialProfile', () => {
    it('should remove profile from localStorage successfully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {});
      
      const result = removeFinancialProfile();
      
      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('fivt_financial_profile');
    });

    it('should return false when localStorage throws error', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = removeFinancialProfile();
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should return false on server-side (no window)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - temporarily remove window for SSR simulation
      global.window = undefined;
      
      const result = removeFinancialProfile();
      
      expect(result).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('hasStoredFinancialProfile', () => {
    it('should return true when valid profile exists', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockProfile));
      
      const result = hasStoredFinancialProfile();
      
      expect(result).toBe(true);
    });

    it('should return false when no profile exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = hasStoredFinancialProfile();
      
      expect(result).toBe(false);
    });

    it('should return false on server-side', () => {
      const originalWindow = global.window;
      // @ts-expect-error - temporarily remove window for SSR simulation
      global.window = undefined;
      
      const result = hasStoredFinancialProfile();
      
      expect(result).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });
  });

  describe('getProfileAge', () => {
    it('should return age in days for valid profile', () => {
      const recentProfile = { ...mockProfile, lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(recentProfile));
      
      const result = getProfileAge();
      
      expect(result).toBeGreaterThanOrEqual(4);
      expect(result).toBeLessThanOrEqual(6); // Allow some flexibility for timing
    });

    it('should return null when no profile exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = getProfileAge();
      
      expect(result).toBe(null);
    });
  });

  describe('isProfileStale', () => {
    it('should return false for fresh profile', () => {
      const freshProfile = { ...mockProfile, lastUpdated: new Date().toISOString() };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(freshProfile));
      
      const result = isProfileStale(30);
      
      expect(result).toBe(false);
    });

    it('should return true for old profile', () => {
      const oldProfile = { ...mockProfile, lastUpdated: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldProfile));
      
      const result = isProfileStale(30);
      
      expect(result).toBe(true);
    });

    it('should return true when no profile exists (no profile is stale)', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = isProfileStale();
      
      expect(result).toBe(true); // No profile is considered stale
    });
  });
});