import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import {
  isPlatformMobile,
  isPlatformIOS,
  isPlatformAndroid,
  openPowensWebview,
  getPowensWebviewRecommendations,
} from '@/app/(protected)/(dashboard)/banking/_utils/platform-utils';

// Mock window methods
const mockOpen = vi.fn();

Object.defineProperty(window, 'open', { value: mockOpen, writable: true });

describe('Platform Utils', () => {
  const mockWindow = {
    closed: false,
    focus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpen.mockReturnValue(mockWindow);
    mockWindow.closed = false;
  });

  afterEach(() => {
    // Reset navigator.userAgent to default
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      writable: true,
    });
  });

  describe('isPlatformMobile', () => {
    it('should return true for Android devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(true);
    });

    it('should return true for iPhone devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(true);
    });

    it('should return true for iPad devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(true);
    });

    it('should return true for iPod devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(true);
    });

    it('should return true for BlackBerry devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(true);
    });

    it('should return true for Opera Mini', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Opera/9.80 (J2ME/MIDP; Opera Mini/9.80 (S60; SymbOS; Opera Mobi/23.348; U; en) Presto/2.5.25 Version/10.54',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(true);
    });

    it('should return false for desktop Chrome', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(false);
    });

    it('should return false for desktop Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(false);
    });

    it('should return false for desktop Safari', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true,
      });

      expect(isPlatformMobile()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR case
      delete global.window;

      expect(isPlatformMobile()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('isPlatformIOS', () => {
    it('should return true for iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformIOS()).toBe(true);
    });

    it('should return true for iPad', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformIOS()).toBe(true);
    });

    it('should return true for iPod', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformIOS()).toBe(true);
    });

    it('should return false for Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        writable: true,
      });

      expect(isPlatformIOS()).toBe(false);
    });

    it('should return false for desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      expect(isPlatformIOS()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR case
      delete global.window;

      expect(isPlatformIOS()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('isPlatformAndroid', () => {
    it('should return true for Android devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        writable: true,
      });

      expect(isPlatformAndroid()).toBe(true);
    });

    it('should return false for iPhone', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      expect(isPlatformAndroid()).toBe(false);
    });

    it('should return false for desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      expect(isPlatformAndroid()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Testing SSR case
      delete global.window;

      expect(isPlatformAndroid()).toBe(false);

      global.window = originalWindow;
    });
  });

  describe('getPowensWebviewRecommendations', () => {
    it('should return Android recommendations for Android devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        writable: true,
      });

      const result = getPowensWebviewRecommendations();

      expect(result).toEqual({
        platform: 'android',
        recommendation: 'Chrome Custom Tabs',
        note: 'For native Android apps, use Chrome Custom Tabs library for optimal app-to-app support'
      });
    });

    it('should return iOS recommendations for iPhone devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const result = getPowensWebviewRecommendations();

      expect(result).toEqual({
        platform: 'ios',
        recommendation: 'SFSafariViewController',
        note: 'For native iOS apps, use SFSafariViewController for optimal app-to-app support'
      });
    });

    it('should return iOS recommendations for iPad devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const result = getPowensWebviewRecommendations();

      expect(result).toEqual({
        platform: 'ios',
        recommendation: 'SFSafariViewController',
        note: 'For native iOS apps, use SFSafariViewController for optimal app-to-app support'
      });
    });

    it('should return mobile-web recommendations for other mobile devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en) AppleWebKit/534.11',
        writable: true,
      });

      const result = getPowensWebviewRecommendations();

      expect(result).toEqual({
        platform: 'mobile-web',
        recommendation: 'New tab/window',
        note: 'Opening in new tab to maximize app-to-app support on mobile browsers'
      });
    });

    it('should return desktop-web recommendations for desktop devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const result = getPowensWebviewRecommendations();

      expect(result).toEqual({
        platform: 'desktop-web',
        recommendation: 'Full-page redirect',
        note: 'Full-page redirect provides best experience for desktop banking flows'
      });
    });
  });

  describe('openPowensWebview', () => {
    const testUrl = 'https://powens.example.com/connect';

    beforeEach(() => {
      // Mock screen properties for desktop positioning
      Object.defineProperty(window, 'screen', {
        value: { width: 1920, height: 1080 },
        writable: true,
      });
    });

    it('should open in new tab for mobile devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      openPowensWebview(testUrl);

      expect(mockOpen).toHaveBeenCalledWith(testUrl, '_blank', 'noopener,noreferrer');
    });

    it('should fallback to current window redirect if mobile popup blocked', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const mockLocationReplace = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: mockLocationReplace },
        writable: true,
      });

      // Simulate popup blocked (returns null)
      mockOpen.mockReturnValue(null);

      openPowensWebview(testUrl);

      expect(mockLocationReplace).toHaveBeenCalledWith(testUrl);
    });

    it('should fallback to current window redirect if mobile popup immediately closed', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const mockLocationReplace = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: mockLocationReplace },
        writable: true,
      });

      // Simulate popup immediately closed
      mockWindow.closed = true;
      mockOpen.mockReturnValue(mockWindow);

      openPowensWebview(testUrl);

      expect(mockLocationReplace).toHaveBeenCalledWith(testUrl);
    });

    it('should open popup window for desktop devices', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      openPowensWebview(testUrl);

      // Calculate expected position
      const expectedLeft = (1920 - 480) / 2;
      const expectedTop = (1080 - 720) / 2;

      expect(mockOpen).toHaveBeenCalledWith(
        testUrl,
        'powens-connect',
        `width=480,height=720,left=${expectedLeft},top=${expectedTop},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
      );
    });

    it('should focus the popup window on desktop', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      openPowensWebview(testUrl);

      expect(mockWindow.focus).toHaveBeenCalled();
    });

    it('should fallback to current window redirect if desktop popup blocked', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const mockLocationReplace = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: mockLocationReplace },
        writable: true,
      });

      // Simulate popup blocked
      mockOpen.mockReturnValue(null);

      openPowensWebview(testUrl);

      expect(mockLocationReplace).toHaveBeenCalledWith(testUrl);
    });

    it('should fallback to current window redirect if desktop popup immediately closed', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const mockLocationReplace = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: mockLocationReplace },
        writable: true,
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Simulate popup immediately closed
      mockWindow.closed = true;
      mockOpen.mockReturnValue(mockWindow);

      openPowensWebview(testUrl);

      expect(consoleSpy).toHaveBeenCalledWith('Popup blocked, falling back to full redirect');
      expect(mockLocationReplace).toHaveBeenCalledWith(testUrl);

      consoleSpy.mockRestore();
    });

    it('should handle Android mobile devices correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
        writable: true,
      });

      openPowensWebview(testUrl);

      expect(mockOpen).toHaveBeenCalledWith(testUrl, '_blank', 'noopener,noreferrer');
    });

    it('should handle edge case with empty URL', () => {
      openPowensWebview('');

      // Should still attempt to open, even with empty URL
      expect(mockOpen).toHaveBeenCalled();
    });

    it('should handle very small screen sizes', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      // Mock very small screen
      Object.defineProperty(window, 'screen', {
        value: { width: 320, height: 480 },
        writable: true,
      });

      openPowensWebview(testUrl);

      // Should still create popup, even if it goes off-screen
      const expectedLeft = (320 - 480) / 2; // Will be negative
      const expectedTop = (480 - 720) / 2; // Will be negative

      expect(mockOpen).toHaveBeenCalledWith(
        testUrl,
        'powens-connect',
        `width=480,height=720,left=${expectedLeft},top=${expectedTop},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
      );
    });
  });
});