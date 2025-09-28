/**
 * Centralized route configuration
 * This file exports all route configurations for easy access
 */

// Common routes
export * from './common';

// Module-specific routes
export * from './banking';
export * from './transactions';
export * from './chat';

// Re-export everything as a single object for convenience
import { COMMON_ROUTES } from './common';
import { BANKING_ROUTES } from './banking';
import { TRANSACTIONS_ROUTES } from './transactions';
import { CHAT_ROUTES } from './chat';

/**
 * Master routes object containing all application routes
 */
export const ROUTES = {
  COMMON: COMMON_ROUTES,
  BANKING: BANKING_ROUTES,
  TRANSACTIONS: TRANSACTIONS_ROUTES,
  CHAT: CHAT_ROUTES,
} as const;

/**
 * Flattened routes for easy access
 */
export const FLAT_ROUTES = {
  // Common
  HOME: COMMON_ROUTES.HOME,
  DASHBOARD: COMMON_ROUTES.DASHBOARD,
  LOGIN: COMMON_ROUTES.AUTH.LOGIN,
  LOGOUT: COMMON_ROUTES.AUTH.LOGOUT,
  
  // Banking
  BANKING: BANKING_ROUTES.INDEX,
  BANKING_POWENS: BANKING_ROUTES.POWENS,
  BANKING_ERROR: BANKING_ROUTES.ERROR,
  
  // Transactions
  TRANSACTIONS: TRANSACTIONS_ROUTES.INDEX,
  TRANSACTIONS_LIST: TRANSACTIONS_ROUTES.LIST,
  
  // Chat
  CHATBOT: CHAT_ROUTES.INDEX,
  CHAT: CHAT_ROUTES.CHAT,
} as const;

/**
 * Route utilities
 */
export { 
  getLocalizedRoute, 
  isApiRoute, 
  isAuthRoute, 
  isProtectedRoute 
} from './common';

export { 
  getBankingAccountRoute, 
  isBankingRoute, 
  isBankingApiRoute 
} from './banking';

export { 
  getTransactionDetailRoute,
  getTransactionsByCategoryRoute,
  isTransactionRoute,
  isTransactionApiRoute 
} from './transactions';

export { 
  getChatSessionRoute, 
  isChatRoute, 
  isChatApiRoute 
} from './chat';

export { RouteValidator, RouteBreadcrumbs } from './utils';