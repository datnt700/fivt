/**
 * Dashboard React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { fetchTransactions, type Transaction } from '../_services/transaction-service';

export { type Transaction };

export function useTransactions(date: Date | null, locale: string) {
  return useQuery({
    queryKey: ['dashboard', 'transactions', date, locale],
    queryFn: () => fetchTransactions(date),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}