/**
 * Route validation and utility functions
 */

import { 
  isApiRoute, 
  isAuthRoute, 
  isProtectedRoute,
  isBankingRoute,
  isTransactionRoute,
  isChatRoute,
  FLAT_ROUTES 
} from '@/config/routes';

/**
 * Route validation utilities
 */
export class RouteValidator {
  /**
   * Check if user can access a route based on authentication status
   */
  static canAccess(pathname: string, isAuthenticated: boolean): boolean {
    // Public routes that don't require authentication
    const publicRoutes = [
      FLAT_ROUTES.HOME,
      FLAT_ROUTES.LOGIN,
      '/about',
      '/contact',
      '/privacy',
      '/terms',
    ];

    // API routes have their own authentication logic
    if (isApiRoute(pathname)) {
      return true;
    }

    // Auth routes are accessible when not authenticated
    if (isAuthRoute(pathname)) {
      return true;
    }

    // Check if it's a public route
    if (publicRoutes.some(route => pathname === route || pathname.endsWith(route))) {
      return true;
    }

    // Protected routes require authentication
    if (isProtectedRoute(pathname)) {
      return isAuthenticated;
    }

    // Default to requiring authentication for unknown routes
    return isAuthenticated;
  }

  /**
   * Get redirect URL based on authentication status and current route
   */
  static getRedirectUrl(pathname: string, isAuthenticated: boolean): string | null {
    if (!isAuthenticated && isProtectedRoute(pathname)) {
      return FLAT_ROUTES.LOGIN;
    }

    if (isAuthenticated && isAuthRoute(pathname)) {
      return FLAT_ROUTES.DASHBOARD;
    }

    return null;
  }

  /**
   * Get route category for analytics or logging
   */
  static getRouteCategory(pathname: string): string {
    if (isApiRoute(pathname)) return 'api';
    if (isAuthRoute(pathname)) return 'auth';
    if (isBankingRoute(pathname)) return 'banking';
    if (isTransactionRoute(pathname)) return 'transactions';
    if (isChatRoute(pathname)) return 'chat';
    if (pathname === FLAT_ROUTES.HOME) return 'home';
    if (pathname === FLAT_ROUTES.DASHBOARD) return 'dashboard';
    return 'other';
  }

  /**
   * Check if route exists (basic validation)
   */
  static isValidRoute(pathname: string): boolean {
    const allRoutes = Object.values(FLAT_ROUTES);
    const dynamicRoutePatterns = [
      /^\/banking\/accounts\/[^/]+$/,
      /^\/transactions\/[^/]+$/,
      /^\/chatbot\/session\/[^/]+$/,
    ];

    // Check exact matches
    if (allRoutes.includes(pathname as (typeof allRoutes)[number])) {
      return true;
    }

    // Check dynamic route patterns
    return dynamicRoutePatterns.some(pattern => pattern.test(pathname));
  }
}

/**
 * Route breadcrumb utilities
 */
export class RouteBreadcrumbs {
  /**
   * Generate breadcrumbs for a given pathname
   */
  static generate(pathname: string): Array<{ label: string; href: string }> {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string }> = [{ label: 'nav.home', href: FLAT_ROUTES.HOME }];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      
      switch (currentPath) {
        case FLAT_ROUTES.DASHBOARD:
          breadcrumbs.push({ label: 'nav.dashboard', href: currentPath });
          break;
        case FLAT_ROUTES.BANKING:
          breadcrumbs.push({ label: 'nav.banking', href: currentPath });
          break;
        case FLAT_ROUTES.TRANSACTIONS:
          breadcrumbs.push({ label: 'nav.transactions', href: currentPath });
          break;
        case FLAT_ROUTES.CHATBOT:
          breadcrumbs.push({ label: 'nav.chatbot', href: currentPath });
          break;
        default:
          // Handle dynamic segments
          if (currentPath.startsWith('/banking/')) {
            breadcrumbs.push({ label: segment, href: currentPath });
          } else if (currentPath.startsWith('/transactions/')) {
            breadcrumbs.push({ label: segment, href: currentPath });
          } else if (currentPath.startsWith('/chatbot/')) {
            breadcrumbs.push({ label: segment, href: currentPath });
          }
          break;
      }
    }

    return breadcrumbs;
  }
}