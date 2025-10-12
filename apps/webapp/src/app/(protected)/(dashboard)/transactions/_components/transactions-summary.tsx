'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import type { Transaction } from '../_types';
import { formatCurrency } from '../_utils';

interface TransactionsSummaryProps {
  transactions: Transaction[];
  totalAmount: number;
  transactionCount: number;
}

export function TransactionsSummary({ 
  transactions, 
  totalAmount, 
  transactionCount 
}: TransactionsSummaryProps) {
  const t = useTranslations('transactions');

  const incomeTransactions = transactions.filter(t => t.value > 0);
  const expenseTransactions = transactions.filter(t => t.value < 0);
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.value, 0);
  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.value, 0));

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('summary.totalTransactions')}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{transactionCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('summary.totalIncome')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">{t('summary.transactionsCount', {count: incomeTransactions.length})}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('summary.totalExpenses')}</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">{t('summary.transactionsCount', {count: expenseTransactions.length})}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('summary.netAmount')}</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalAmount)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}