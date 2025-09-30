'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import type { ManualTransaction } from '../_types';
import { formatCurrency, formatDate } from '../_utils';

interface ManualTransactionsListProps {
  transactions: ManualTransaction[] | undefined;
  loading: boolean;
  error: Error | null;
}

export function ManualTransactionsList({ 
  transactions, 
  loading, 
  error 
}: ManualTransactionsListProps) {
  const t = useTranslations('transactions');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('manualTransactions')}</CardTitle>
        <CardDescription>
          {t('manualSubtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('failedToLoadManual')}</AlertDescription>
          </Alert>
        ) : !transactions || transactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noManualTransactions')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('noManualTransactionsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction: ManualTransaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'INCOME' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900/20'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{transaction.description || t('name')}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{formatDate(transaction.createdAt)}</span>
                      <span>•</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/20 dark:text-blue-300">
                        {t('manual')}
                      </span>
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
                  transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}