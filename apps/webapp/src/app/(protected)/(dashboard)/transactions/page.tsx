'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { 
  CreateTransactionFormCard, 
  TransactionsSummary, 
  BankTransactionsList, 
  ManualTransactionsList,
  MonthSelector 
} from './_components';
import { useTransactions } from './_hooks/use-transaction';
import type { Transaction } from './_types';
import { getMonthOptions } from './_utils';
import 'react-datepicker/dist/react-datepicker.css';

export default function TransactionsPage() {
  const t = useTranslations('transactions');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);

  // Fetch manual transactions
  const { data: manualTransactions, isLoading: manualLoading, error: manualError } = useTransactions();

  const fetchTransactions = async (month: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/powens/transactions?month=${month}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }
      
      setTransactions(data.transactions);
      setTotalAmount(data.total);
      setTransactionCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTransactions([]);
      setTotalAmount(0);
      setTransactionCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bankTransactions')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onRefresh={() => fetchTransactions(selectedMonth)}
          loading={loading}
        />
      </div>

      <TransactionsSummary
        transactions={transactions}
        totalAmount={totalAmount}
        transactionCount={transactionCount}
      />

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <BankTransactionsList
        transactions={transactions}
        loading={loading}
        error={error}
        selectedMonth={selectedMonth}
        monthOptions={getMonthOptions()}
      />

      <ManualTransactionsList
        transactions={manualTransactions}
        loading={manualLoading}
        error={manualError}
      />

      {/* Manual Transaction Creation */}
      <CreateTransactionFormCard />
    </div>
  );
}