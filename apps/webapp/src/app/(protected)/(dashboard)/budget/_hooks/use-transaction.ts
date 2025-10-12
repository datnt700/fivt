import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { transactionService } from '../_services/transaction-service';

export function useCreateTransaction() {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', locale] });
    },
  });
}

export function useTransactions() {
  const locale = useLocale();

  return useQuery({
    queryKey: ['transactions', locale],
    queryFn: () => transactionService.getTransactions(locale),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
