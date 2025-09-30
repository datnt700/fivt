'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import type { Transaction, MonthOption } from '../_types';
import { formatCurrency, formatDate } from '../_utils';

interface BankTransactionsListProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  selectedMonth: string;
  monthOptions: MonthOption[];
}

export function BankTransactionsList({ 
  transactions, 
  loading, 
  error, 
  selectedMonth, 
  monthOptions 
}: BankTransactionsListProps) {
  const t = useTranslations('transactions');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('transactionHistory')}</CardTitle>
        <CardDescription>
          {t('bankTransactions')} for {monthOptions.find(opt => opt.value === selectedMonth)?.label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noBankTransactions')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('noBankTransactionsDesc')}
            </p>
            {error && error.includes('not connected') && (
              <Button onClick={() => window.location.href = '/banking'}>
                {t('connectBankAccount')}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.value > 0 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                  }`}>
                    {transaction.value > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{transaction.simplified_wording || transaction.original_wording}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.accountName && (
                        <>
                          <span>•</span>
                          <span>{transaction.accountName}</span>
                        </>
                      )}
                      {transaction.category && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category.name}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.value > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(transaction.value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}