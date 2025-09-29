/**
 * Navigation configuration using the centralized route system
 */

import { FLAT_ROUTES } from '@/config/routes';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
}

/**
 * Main navigation items
 */
export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    label: 'nav.dashboard',
    href: FLAT_ROUTES.DASHBOARD,
    icon: 'dashboard',
    requiresAuth: true,
  },
  {
    label: 'nav.banking',
    href: FLAT_ROUTES.BANKING,
    icon: 'bank',
    requiresAuth: true,
    children: [
      {
        label: 'nav.banking.accounts',
        href: `${FLAT_ROUTES.BANKING}/accounts`,
      },
      {
        label: 'nav.banking.connect',
        href: `${FLAT_ROUTES.BANKING}/connect`,
      },
    ],
  },
  {
    label: 'nav.transactions',
    href: FLAT_ROUTES.TRANSACTIONS,
    icon: 'transactions',
    requiresAuth: true,
  },
  {
    label: 'nav.chatbot',
    href: FLAT_ROUTES.CHATBOT,
    icon: 'chat',
    requiresAuth: true,
  },
];

/**
 * Footer navigation items
 */
export const FOOTER_NAVIGATION: NavigationItem[] = [
  {
    label: 'nav.home',
    href: FLAT_ROUTES.HOME,
  },
  {
    label: 'nav.about',
    href: '/about',
  },
  {
    label: 'nav.contact',
    href: '/contact',
  },
  {
    label: 'nav.privacy',
    href: '/privacy',
  },
  {
    label: 'nav.terms',
    href: '/terms',
  },
];

/**
 * Authentication navigation items
 */
export const AUTH_NAVIGATION: NavigationItem[] = [
  {
    label: 'nav.login',
    href: FLAT_ROUTES.LOGIN,
  },
];

/**
 * Get navigation items based on authentication status
 */
export function getNavigationItems(isAuthenticated: boolean): NavigationItem[] {
  if (isAuthenticated) {
    return MAIN_NAVIGATION;
  }
  return AUTH_NAVIGATION;
}

/**
 * Check if a route is active based on current pathname
 */
export function isRouteActive(currentPath: string, routeHref: string): boolean {
  if (routeHref === FLAT_ROUTES.HOME) {
    return currentPath === routeHref;
  }
  return currentPath.startsWith(routeHref);
}