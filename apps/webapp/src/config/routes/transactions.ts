/**
 * Transactions module routes
 * All routes related to transaction management
 */

export const TRANSACTIONS_ROUTES = {
  // Main transaction routes
  INDEX: '/transactions',
  LIST: '/transactions/list',
  DETAIL: '/transactions/[id]',
  
  // Transaction actions
  CATEGORIZE: '/transactions/categorize',
  EXPORT: '/transactions/export',
  IMPORT: '/transactions/import',
  
  // Transaction filters
  BY_CATEGORY: '/transactions/category/[category]',
  BY_DATE: '/transactions/date/[date]',
  BY_ACCOUNT: '/transactions/account/[accountId]',
  
  // API routes for transactions
  API: {
    LIST: '/api/transactions',
    DETAIL: '/api/transactions/[id]',
    CATEGORIZE: '/api/transactions/categorize',
    EXPORT: '/api/transactions/export',
    IMPORT: '/api/transactions/import',
    SEARCH: '/api/transactions/search',
    STATS: '/api/transactions/stats',
  },
} as const;

/**
 * Helper functions for transaction routes
 */
export function getTransactionDetailRoute(transactionId: string): string {
  return `/transactions/${transactionId}`;
}

export function getTransactionsByCategoryRoute(category: string): string {
  return `/transactions/category/${category}`;
}

export function getTransactionsByDateRoute(date: string): string {
  return `/transactions/date/${date}`;
}

export function getTransactionsByAccountRoute(accountId: string): string {
  return `/transactions/account/${accountId}`;
}

export function isTransactionRoute(pathname: string): boolean {
  return pathname.startsWith('/transactions');
}

export function isTransactionApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/transactions');
}