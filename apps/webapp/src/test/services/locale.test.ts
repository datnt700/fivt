import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cookies } from 'next/headers';
import { getUserLocale, setUserLocale } from '@/services/locale';
import type { Locale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Locale Service', () => {
  let mockCookieStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };

  const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

  beforeEach(() => {
    mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: 'en' }),
      set: vi.fn().mockReturnValue(undefined),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserLocale', () => {
    it('should return locale from cookie when present', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'fr' });

      const result = await getUserLocale();

      expect(result).toBe('fr');
      expect(mockCookieStore.get).toHaveBeenCalledWith(LOCALE_COOKIE_NAME);
    });

    it('should return default locale when cookie is not present', async () => {
      mockCookieStore.get.mockReturnValue(null);

      const result = await getUserLocale();

      expect(result).toBe(defaultLocale);
    });

    it('should return default locale when cookie value is empty', async () => {
      mockCookieStore.get.mockReturnValue({ value: '' });

      const result = await getUserLocale();

      expect(result).toBe(defaultLocale);
    });

    it('should handle each supported locale', async () => {
      const supportedLocales: Locale[] = ['en', 'fr', 'vi'];

      for (const locale of supportedLocales) {
        mockCookieStore.get.mockReturnValue({ value: locale });
        const result = await getUserLocale();
        expect(result).toBe(locale);
      }
    });

    it('should handle invalid locale gracefully', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'invalid' });

      const result = await getUserLocale();

      expect(result).toBe('invalid'); // The actual implementation doesn't validate
    });

    it('should handle cookies function throwing error', async () => {
      vi.mocked(cookies).mockRejectedValue(new Error('Cookies not available'));

      await expect(getUserLocale()).rejects.toThrow('Cookies not available');
    });

    it('should handle cookie store get method throwing error', async () => {
      mockCookieStore.get.mockImplementation(() => {
        throw new Error('Cookie get failed');
      });

      await expect(getUserLocale()).rejects.toThrow('Cookie get failed');
    });
  });

  describe('setUserLocale', () => {
    it('should set locale cookie with correct name and value', async () => {
      await setUserLocale('fr');

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        LOCALE_COOKIE_NAME,
        'fr'
      );
    });

    it('should set each supported locale correctly', async () => {
      const locales: Locale[] = ['en', 'fr', 'vi'];

      for (const locale of locales) {
        mockCookieStore.set.mockClear();
        await setUserLocale(locale);

        expect(mockCookieStore.set).toHaveBeenCalledWith(
          LOCALE_COOKIE_NAME,
          locale
        );
      }
    });

    it('should handle cookies function throwing error', async () => {
      vi.mocked(cookies).mockRejectedValue(new Error('Cookies not available'));

      await expect(setUserLocale('fr')).rejects.toThrow('Cookies not available');
    });

    it('should handle cookie store set method throwing error', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cookie set failed');
      });

      // Should propagate the error
      await expect(setUserLocale('fr')).rejects.toThrow('Cookie set failed');
    });
  });

  describe('Cookie Integration', () => {
    beforeEach(() => {
      // Reset mocks to clean state for integration tests
      vi.clearAllMocks();
      
      mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'en' }),
        set: vi.fn().mockReturnValue(undefined),
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    });

    it('should use consistent cookie name between get and set operations', async () => {
      const cookieName = 'NEXT_LOCALE';

      // Test get operation
      await getUserLocale();
      expect(mockCookieStore.get).toHaveBeenCalledWith(cookieName);

      // Test set operation  
      await setUserLocale('fr');
      expect(mockCookieStore.set).toHaveBeenCalledWith(cookieName, 'fr');
    });

    it('should handle round-trip locale operations', async () => {
      // Set a locale
      await setUserLocale('vi');

      // Mock the cookie to return the set value for subsequent get
      mockCookieStore.get.mockReturnValue({ value: 'vi' });

      // Get the locale back
      const result = await getUserLocale();

      expect(result).toBe('vi');
      expect(mockCookieStore.set).toHaveBeenCalledWith('NEXT_LOCALE', 'vi');
      expect(mockCookieStore.get).toHaveBeenCalledWith('NEXT_LOCALE');
    });
  });

  describe('Type Safety', () => {
    beforeEach(() => {
      // Reset mocks to clean state
      vi.clearAllMocks();
      
      mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'en' }),
        set: vi.fn().mockReturnValue(undefined),
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    });

    it('should accept only valid locale types for setUserLocale', async () => {
      const validLocales: Locale[] = ['en', 'fr', 'vi'];

      for (const locale of validLocales) {
        await setUserLocale(locale);
      }

      expect(mockCookieStore.set).toHaveBeenCalledTimes(validLocales.length);
    });

    it('should return Locale type from getUserLocale', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'fr' });

      const result = await getUserLocale();

      // Type check - result should be assignable to Locale
      const localeCheck: Locale = result;
      expect(localeCheck).toBe('fr');
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      // Reset mocks to clean state
      vi.clearAllMocks();
      
      mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'en' }),
        set: vi.fn().mockReturnValue(undefined),
      };
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
    });

    it('should handle empty cookie store', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getUserLocale();

      expect(result).toBe(defaultLocale);
    });

    it('should handle cookie store returning unexpected data types', async () => {
      mockCookieStore.get.mockReturnValue({ value: 123 }); // number instead of string

      const result = await getUserLocale();

      expect(result).toBe(123); // The actual implementation doesn't validate types
    });

    it('should handle cookie store returning complex objects', async () => {
      mockCookieStore.get.mockReturnValue({ 
        value: { nested: 'object' } 
      });

      const result = await getUserLocale();

      expect(result).toEqual({ nested: 'object' }); // Returns the actual value
    });
  });
});