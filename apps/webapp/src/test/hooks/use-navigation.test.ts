import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import useNavigation from '@/hooks/use-navigation';
import { usePathname } from 'next/navigation';

const mockUsePathname = vi.mocked(usePathname);

describe('useNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Home navigation', () => {
    it('should return isHomeActive as true for root path', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(true);
      expect(result.current.isExploreActive).toBe(false);
      expect(result.current.isNotificationsActive).toBe(false);
      expect(result.current.isMessagesActive).toBe(false);
    });

    it('should return isHomeActive as true for empty path after locale removal', () => {
      mockUsePathname.mockReturnValue('/en');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(true);
    });

    it('should return isHomeActive as true for localized root paths', () => {
      const localizedPaths = ['/en/', '/vi/', '/fr/'];
      
      localizedPaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isHomeActive).toBe(true);
      });
    });
  });

  describe('Explore navigation', () => {
    it('should return isExploreActive as true for explore path', () => {
      mockUsePathname.mockReturnValue('/explore');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(false);
      expect(result.current.isExploreActive).toBe(true);
      expect(result.current.isNotificationsActive).toBe(false);
      expect(result.current.isMessagesActive).toBe(false);
    });

    it('should return isExploreActive as true for explore subpaths', () => {
      const explorePaths = ['/explore/trending', '/explore/categories', '/explore/search'];
      
      explorePaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isExploreActive).toBe(true);
      });
    });

    it('should return isExploreActive as true for localized explore paths', () => {
      const localizedExplorePaths = ['/en/explore', '/vi/explore/trending', '/fr/explore/search'];
      
      localizedExplorePaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isExploreActive).toBe(true);
      });
    });
  });

  describe('Notifications navigation', () => {
    it('should return isNotificationsActive as true for notifications path', () => {
      mockUsePathname.mockReturnValue('/notifications');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(false);
      expect(result.current.isExploreActive).toBe(false);
      expect(result.current.isNotificationsActive).toBe(true);
      expect(result.current.isMessagesActive).toBe(false);
    });

    it('should return isNotificationsActive as true for notifications subpaths', () => {
      const notificationPaths = ['/notifications/recent', '/notifications/settings'];
      
      notificationPaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isNotificationsActive).toBe(true);
      });
    });

    it('should return isNotificationsActive as true for localized notifications paths', () => {
      const localizedNotificationPaths = ['/en/notifications', '/vi/notifications/recent', '/fr/notifications/settings'];
      
      localizedNotificationPaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isNotificationsActive).toBe(true);
      });
    });
  });

  describe('Messages navigation', () => {
    it('should return isMessagesActive as true for messages path', () => {
      mockUsePathname.mockReturnValue('/messages');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(false);
      expect(result.current.isExploreActive).toBe(false);
      expect(result.current.isNotificationsActive).toBe(false);
      expect(result.current.isMessagesActive).toBe(true);
    });

    it('should return isMessagesActive as true for messages subpaths', () => {
      const messagePaths = ['/messages/inbox', '/messages/sent', '/messages/drafts'];
      
      messagePaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isMessagesActive).toBe(true);
      });
    });

    it('should return isMessagesActive as true for localized messages paths', () => {
      const localizedMessagePaths = ['/en/messages', '/vi/messages/inbox', '/fr/messages/sent'];
      
      localizedMessagePaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isMessagesActive).toBe(true);
      });
    });
  });

  describe('Locale handling', () => {
    it('should correctly strip English locale from path', () => {
      mockUsePathname.mockReturnValue('/en/explore/trending');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isExploreActive).toBe(true);
    });

    it('should correctly strip Vietnamese locale from path', () => {
      mockUsePathname.mockReturnValue('/vi/notifications/recent');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isNotificationsActive).toBe(true);
    });

    it('should correctly strip French locale from path', () => {
      mockUsePathname.mockReturnValue('/fr/messages/inbox');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isMessagesActive).toBe(true);
    });

    it('should handle paths without locale prefix', () => {
      mockUsePathname.mockReturnValue('/explore/categories');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isExploreActive).toBe(true);
    });

    it('should not strip non-locale prefixes', () => {
      mockUsePathname.mockReturnValue('/english/explore'); // 'english' should not be stripped
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(false);
      expect(result.current.isExploreActive).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle complex nested paths', () => {
      mockUsePathname.mockReturnValue('/en/explore/categories/technology/ai');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isExploreActive).toBe(true);
      expect(result.current.isHomeActive).toBe(false);
    });

    it('should handle paths with query parameters (pathname should not include them)', () => {
      mockUsePathname.mockReturnValue('/en/messages');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isMessagesActive).toBe(true);
    });

    it('should handle unknown paths', () => {
      mockUsePathname.mockReturnValue('/unknown/path');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(false);
      expect(result.current.isExploreActive).toBe(false);
      expect(result.current.isNotificationsActive).toBe(false);
      expect(result.current.isMessagesActive).toBe(false);
    });

    it('should handle root locale paths correctly', () => {
      const rootLocalePaths = ['/en', '/vi', '/fr'];
      
      rootLocalePaths.forEach(path => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        expect(result.current.isHomeActive).toBe(true);
        expect(result.current.isExploreActive).toBe(false);
        expect(result.current.isNotificationsActive).toBe(false);
        expect(result.current.isMessagesActive).toBe(false);
      });
    });

    it('should handle empty pathname', () => {
      mockUsePathname.mockReturnValue('');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(result.current.isHomeActive).toBe(true);
    });

    it('should handle paths that start with navigation paths (startsWith behavior)', () => {
      const testCases = [
        { path: '/explorers', expected: { explore: true } }, // '/explorers' starts with '/explore'
        { path: '/messagesExtra', expected: { messages: true } }, // '/messagesExtra' starts with '/messages'  
        { path: '/notification', expected: { notifications: false } }, // '/notification' does NOT start with '/notifications'
        { path: '/messaged', expected: { messages: false } }, // '/messaged' does NOT start with '/messages'
      ];

      testCases.forEach(({ path, expected }) => {
        mockUsePathname.mockReturnValue(path);
        
        const { result } = renderHook(() => useNavigation());
        
        if ('explore' in expected) {
          expect(result.current.isExploreActive).toBe(expected.explore);
        }
        if ('messages' in expected) {
          expect(result.current.isMessagesActive).toBe(expected.messages);
        }
        if ('notifications' in expected) {
          expect(result.current.isNotificationsActive).toBe(expected.notifications);
        }
      });
    });
  });

  describe('Return value consistency', () => {
    it('should always return boolean values', () => {
      mockUsePathname.mockReturnValue('/any/path');
      
      const { result } = renderHook(() => useNavigation());
      
      expect(typeof result.current.isHomeActive).toBe('boolean');
      expect(typeof result.current.isExploreActive).toBe('boolean');
      expect(typeof result.current.isNotificationsActive).toBe('boolean');
      expect(typeof result.current.isMessagesActive).toBe('boolean');
    });

    it('should return consistent structure', () => {
      mockUsePathname.mockReturnValue('/');
      
      const { result } = renderHook(() => useNavigation());
      
      const expectedKeys = ['isHomeActive', 'isExploreActive', 'isNotificationsActive', 'isMessagesActive'];
      const actualKeys = Object.keys(result.current);
      
      expect(actualKeys).toEqual(expectedKeys);
    });
  });
});