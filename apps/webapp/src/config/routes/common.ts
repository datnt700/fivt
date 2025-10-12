/**
 * Common application routes that are used across the entire application
 * These routes are not specific to any particular feature module
 */

export const COMMON_ROUTES = {
  // Authentication routes
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_REQUEST: '/auth/verify-request',
    CALLBACK: '/auth/callback',
  },

  // Core application routes
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // Profile routes
  PROFILE: {
    SETUP: '/profile/setup',
    VIEW: '/profile',
    EDIT: '/profile/edit',
    RESULTS: '/profile/results',
  },
  
  // API routes - common
  API: {
    AUTH: '/api/auth',
    HEALTH: '/api/health',
  },

  // Error and utility routes
  ERROR: '/error',
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/401',
} as const;

/**
 * Route patterns for dynamic routes
 */
export const ROUTE_PATTERNS = {
  LOCALE: '/(en|fr|vi)',
  API_CATCH_ALL: '/api/[...path]',
} as const;

/**
 * Helper function to get localized route
 */
export function getLocalizedRoute(route: string, locale: string = 'en'): string {
  return `/${locale}${route}`;
}

/**
 * Helper function to check if a route is an API route
 */
export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

/**
 * Helper function to check if a route is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/');
}

/**
 * Helper function to check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ['/dashboard', '/banking', '/transactions', '/chatbot', '/profile'];
  return protectedPaths.some(path => pathname.startsWith(path));
}