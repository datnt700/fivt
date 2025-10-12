// Common types for banking module

// Connection provider data interfaces
export interface PowensConnectionData {
  webviewUrl: string;
  userId: string;
}

export interface BridgeConnectionData {
  redirectUrl: string;
  userUuid: string;
}

// Component props interfaces
export interface PowensLinkProps {
  onSuccess?: (data: PowensConnectionData) => void;
  onError?: (error: string) => void;
}

export interface BridgeLinkProps {
  onSuccess?: (data: BridgeConnectionData) => void;
}

// Common banking connection states
export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

// Banking provider types
export type BankingProvider = 'powens' | 'bridge' | 'plaid';

export interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  provider: BankingProvider;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  category?: string;
  provider: BankingProvider;
}