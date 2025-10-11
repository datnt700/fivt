import { vi } from 'vitest';

/**
 * Common mock for next-intl useLocale hook
 * Returns 'en' by default but can be configured in individual tests
 */
export const mockUseLocale = vi.fn(() => 'en');

/**
 * Mock configuration for next-intl module
 * Use this in vi.mock() calls for consistent next-intl mocking
 */
export const nextIntlMockConfig = {
  useLocale: mockUseLocale,
  useTranslations: vi.fn(() => (key: string) => {
    // Simple fallback that returns the key if no specific mock is provided
    return key;
  }),
};

/**
 * Helper to set up next-intl mocks in tests
 * Call this in your test files to get consistent mocking
 */
export const setupNextIntlMocks = () => {
  vi.mock('next-intl', () => nextIntlMockConfig);
};
