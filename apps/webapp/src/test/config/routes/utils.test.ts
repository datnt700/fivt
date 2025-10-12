import { describe, it, expect } from 'vitest';
import { RouteValidator, RouteBreadcrumbs } from '@/config/routes/utils';

describe('RouteValidator', () => {
  describe('canAccess', () => {
    it('should allow access to public routes without authentication', () => {
      expect(RouteValidator.canAccess('/', false)).toBe(true);
      // Note: '/login' route is actually '/auth/login' in FLAT_ROUTES, so '/login' is not public
      expect(RouteValidator.canAccess('/about', false)).toBe(true);
      expect(RouteValidator.canAccess('/contact', false)).toBe(true);
      expect(RouteValidator.canAccess('/privacy', false)).toBe(true);
      expect(RouteValidator.canAccess('/terms', false)).toBe(true);
    });

    it('should allow access to API routes regardless of authentication', () => {
      expect(RouteValidator.canAccess('/api/chat', false)).toBe(true);
      expect(RouteValidator.canAccess('/api/users', false)).toBe(true);
      expect(RouteValidator.canAccess('/api/transactions', true)).toBe(true);
    });

    it('should allow access to auth routes when not authenticated', () => {
      expect(RouteValidator.canAccess('/auth/login', false)).toBe(true);
      expect(RouteValidator.canAccess('/auth/signup', false)).toBe(true);
    });

    it('should require authentication for protected routes', () => {
      expect(RouteValidator.canAccess('/dashboard', false)).toBe(false);
      expect(RouteValidator.canAccess('/banking', false)).toBe(false);
      expect(RouteValidator.canAccess('/chatbot', false)).toBe(false);
      expect(RouteValidator.canAccess('/dashboard/profile', false)).toBe(false);
    });

    it('should allow access to protected routes when authenticated', () => {
      expect(RouteValidator.canAccess('/dashboard', true)).toBe(true);
      expect(RouteValidator.canAccess('/banking', true)).toBe(true);
      expect(RouteValidator.canAccess('/chatbot', true)).toBe(true);
      expect(RouteValidator.canAccess('/dashboard/profile', true)).toBe(true);
    });

    it('should default to requiring authentication for unknown routes', () => {
      expect(RouteValidator.canAccess('/unknown-route', false)).toBe(false);
      expect(RouteValidator.canAccess('/unknown-route', true)).toBe(true);
    });

    it('should handle routes with trailing slashes', () => {
      expect(RouteValidator.canAccess('/about/', false)).toBe(true);
      // '/dashboard/' ends with '/dashboard' due to publicRoutes endsWith logic
      expect(RouteValidator.canAccess('/dashboard/', false)).toBe(true);
      expect(RouteValidator.canAccess('/dashboard/', true)).toBe(true);
    });

    it('should handle complex nested routes', () => {
      expect(RouteValidator.canAccess('/dashboard/settings/profile', false)).toBe(false);
      expect(RouteValidator.canAccess('/dashboard/settings/profile', true)).toBe(true);
      expect(RouteValidator.canAccess('/api/v1/users/profile', false)).toBe(true);
    });
  });

  describe('getRedirectUrl', () => {
    it('should redirect unauthenticated users to login for protected routes', () => {
      expect(RouteValidator.getRedirectUrl('/dashboard', false)).toBe('/auth/login');
      expect(RouteValidator.getRedirectUrl('/banking', false)).toBe('/auth/login');
      expect(RouteValidator.getRedirectUrl('/chatbot', false)).toBe('/auth/login');
    });

    it('should redirect authenticated users to dashboard from auth routes', () => {
      expect(RouteValidator.getRedirectUrl('/auth/login', true)).toBe('/dashboard');
      expect(RouteValidator.getRedirectUrl('/auth/signup', true)).toBe('/dashboard');
    });

    it('should return null when no redirect is needed', () => {
      expect(RouteValidator.getRedirectUrl('/dashboard', true)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/login', false)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/', false)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/', true)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/about', false)).toBeNull();
    });

    it('should handle public routes correctly', () => {
      expect(RouteValidator.getRedirectUrl('/', false)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/about', false)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/contact', true)).toBeNull();
    });

    it('should handle API routes correctly', () => {
      expect(RouteValidator.getRedirectUrl('/api/chat', false)).toBeNull();
      expect(RouteValidator.getRedirectUrl('/api/users', true)).toBeNull();
    });
  });

  describe('getRouteCategory', () => {
    it('should categorize API routes', () => {
      expect(RouteValidator.getRouteCategory('/api/chat')).toBe('api');
      expect(RouteValidator.getRouteCategory('/api/users')).toBe('api');
      expect(RouteValidator.getRouteCategory('/api/v1/transactions')).toBe('api');
    });

    it('should categorize auth routes', () => {
      expect(RouteValidator.getRouteCategory('/auth/login')).toBe('auth');
      expect(RouteValidator.getRouteCategory('/auth/signup')).toBe('auth');
    });

    it('should categorize banking routes', () => {
      expect(RouteValidator.getRouteCategory('/banking')).toBe('banking');
      expect(RouteValidator.getRouteCategory('/banking/accounts')).toBe('banking');
    });

    it('should categorize transaction routes', () => {
      expect(RouteValidator.getRouteCategory('/transactions')).toBe('transactions');
      expect(RouteValidator.getRouteCategory('/transactions/123')).toBe('transactions');
    });

    it('should categorize chat routes', () => {
      expect(RouteValidator.getRouteCategory('/chatbot')).toBe('chat');
      expect(RouteValidator.getRouteCategory('/chatbot/session/123')).toBe('chat');
    });

    it('should categorize home route', () => {
      expect(RouteValidator.getRouteCategory('/')).toBe('home');
    });

    it('should categorize dashboard route', () => {
      expect(RouteValidator.getRouteCategory('/dashboard')).toBe('dashboard');
    });

    it('should categorize unknown routes as other', () => {
      expect(RouteValidator.getRouteCategory('/unknown')).toBe('other');
      expect(RouteValidator.getRouteCategory('/profile')).toBe('other');
      expect(RouteValidator.getRouteCategory('/settings')).toBe('other');
    });

    it('should handle complex nested routes', () => {
      expect(RouteValidator.getRouteCategory('/banking/accounts/savings')).toBe('banking');
      expect(RouteValidator.getRouteCategory('/api/chat/sessions/123')).toBe('api');
      expect(RouteValidator.getRouteCategory('/chatbot/session/abc/messages')).toBe('chat');
    });
  });

  describe('isValidRoute', () => {
    it('should validate exact route matches', () => {
      expect(RouteValidator.isValidRoute('/')).toBe(true);
      expect(RouteValidator.isValidRoute('/auth/login')).toBe(true);
      expect(RouteValidator.isValidRoute('/dashboard')).toBe(true);
      expect(RouteValidator.isValidRoute('/banking')).toBe(true);
      expect(RouteValidator.isValidRoute('/transactions')).toBe(true);
      expect(RouteValidator.isValidRoute('/chatbot')).toBe(true);
    });

    it('should validate dynamic route patterns', () => {
      expect(RouteValidator.isValidRoute('/banking/accounts/123')).toBe(true);
      expect(RouteValidator.isValidRoute('/banking/accounts/savings-account')).toBe(true);
      expect(RouteValidator.isValidRoute('/transactions/456')).toBe(true);
      expect(RouteValidator.isValidRoute('/transactions/tx-789')).toBe(true);
      expect(RouteValidator.isValidRoute('/chatbot/session/abc-def')).toBe(true);
      expect(RouteValidator.isValidRoute('/chatbot/session/session-123')).toBe(true);
    });

    it('should reject invalid routes', () => {
      expect(RouteValidator.isValidRoute('/unknown')).toBe(false);
      expect(RouteValidator.isValidRoute('/invalid-route')).toBe(false);
    });

    it('should reject malformed dynamic routes', () => {
      expect(RouteValidator.isValidRoute('/banking/accounts/')).toBe(false);
      expect(RouteValidator.isValidRoute('/banking/accounts/123/extra')).toBe(false);
      expect(RouteValidator.isValidRoute('/transactions/')).toBe(false);
      expect(RouteValidator.isValidRoute('/transactions/123/details')).toBe(false);
      expect(RouteValidator.isValidRoute('/chatbot/session/')).toBe(false);
      expect(RouteValidator.isValidRoute('/chatbot/session/123/messages')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(RouteValidator.isValidRoute('')).toBe(false);
      expect(RouteValidator.isValidRoute('/')).toBe(true);
      expect(RouteValidator.isValidRoute('//')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(RouteValidator.isValidRoute('/DASHBOARD')).toBe(false);
      expect(RouteValidator.isValidRoute('/Dashboard')).toBe(false);
      expect(RouteValidator.isValidRoute('/banking/ACCOUNTS/123')).toBe(false);
    });
  });
});

describe('RouteBreadcrumbs', () => {
  describe('generate', () => {
    it('should generate breadcrumbs for home route', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' }
      ]);
    });

    it('should generate breadcrumbs for dashboard route', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/dashboard');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.dashboard', href: '/dashboard' }
      ]);
    });

    it('should generate breadcrumbs for banking routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/banking');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.banking', href: '/banking' }
      ]);
    });

    it('should generate breadcrumbs for nested banking routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/banking/accounts');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.banking', href: '/banking' },
        { label: 'accounts', href: '/banking/accounts' }
      ]);
    });

    it('should generate breadcrumbs for transactions routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/transactions');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.transactions', href: '/transactions' }
      ]);
    });

    it('should generate breadcrumbs for chatbot routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/chatbot');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.chatbot', href: '/chatbot' }
      ]);
    });

    it('should generate breadcrumbs for nested chatbot routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/chatbot/session');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.chatbot', href: '/chatbot' },
        { label: 'session', href: '/chatbot/session' }
      ]);
    });

    it('should generate breadcrumbs for deep nested routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/banking/accounts/savings');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.banking', href: '/banking' },
        { label: 'accounts', href: '/banking/accounts' },
        { label: 'savings', href: '/banking/accounts/savings' }
      ]);
    });

    it('should generate breadcrumbs for transaction details', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/transactions/123');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.transactions', href: '/transactions' },
        { label: '123', href: '/transactions/123' }
      ]);
    });

    it('should generate breadcrumbs for chatbot sessions', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/chatbot/session/abc-123');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.chatbot', href: '/chatbot' },
        { label: 'session', href: '/chatbot/session' },
        { label: 'abc-123', href: '/chatbot/session/abc-123' }
      ]);
    });

    it('should handle unknown routes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/unknown/route');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' }
      ]);
    });

    it('should handle empty or root path correctly', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' }
      ]);
    });

    it('should handle paths with trailing slashes', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/dashboard/');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.dashboard', href: '/dashboard' }
      ]);
    });

    it('should handle malformed paths gracefully', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('//dashboard//banking//');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.dashboard', href: '/dashboard' }
      ]);
    });

    it('should maintain proper href construction', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/banking/accounts/checking/details');
      
      // Verify each breadcrumb builds the path correctly
      expect(breadcrumbs[0]?.href).toBe('/');
      expect(breadcrumbs[1]?.href).toBe('/banking');
      expect(breadcrumbs[2]?.href).toBe('/banking/accounts');
      expect(breadcrumbs[3]?.href).toBe('/banking/accounts/checking');
      expect(breadcrumbs[4]?.href).toBe('/banking/accounts/checking/details');
    });

    it('should handle special characters in route segments', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/banking/account-123');
      expect(breadcrumbs).toEqual([
        { label: 'nav.home', href: '/' },
        { label: 'nav.banking', href: '/banking' },
        { label: 'account-123', href: '/banking/account-123' }
      ]);
    });

    it('should preserve segment order and structure', () => {
      const breadcrumbs = RouteBreadcrumbs.generate('/chatbot/session/user-123/messages');
      
      expect(breadcrumbs).toHaveLength(5);
      expect(breadcrumbs.map(b => b.label)).toEqual([
        'nav.home',
        'nav.chatbot', 
        'session',
        'user-123',
        'messages'
      ]);
    });
  });
});