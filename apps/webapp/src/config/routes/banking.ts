/**
 * Banking module routes
 * All routes related to banking functionality
 */

export const BANKING_ROUTES = {
  // Main banking routes
  INDEX: '/banking',
  ACCOUNTS: '/banking/accounts',
  ACCOUNT_DETAIL: '/banking/accounts/[id]',
  
  // Banking providers
  POWENS: '/banking/powens',
  BOWENS: '/banking/bowens',
  
  // Banking actions
  CONNECT: '/banking/connect',
  DISCONNECT: '/banking/disconnect',
  SYNC: '/banking/sync',
  
  // Banking errors
  ERROR: '/banking/error',
  
  // API routes for banking
  API: {
    POWENS: {
      CONNECT: '/api/powens/connect',
      CALLBACK: '/api/powens/callback',
      ACCOUNTS: '/api/powens/accounts',
      TRANSACTIONS: '/api/powens/transactions',
      SYNC: '/api/powens/sync',
    },
    BRIDGE: {
      CONNECT: '/api/bridge/connect',
      CALLBACK: '/api/bridge/callback',
      ACCOUNTS: '/api/bridge/accounts',
      TRANSACTIONS: '/api/bridge/transactions',
    },
  },
} as const;

/**
 * Helper functions for banking routes
 */
export function getBankingAccountRoute(accountId: string): string {
  return `/banking/accounts/${accountId}`;
}

export function isBankingRoute(pathname: string): boolean {
  return pathname.startsWith('/banking');
}

export function isBankingApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/powens') || pathname.startsWith('/api/bridge');
}