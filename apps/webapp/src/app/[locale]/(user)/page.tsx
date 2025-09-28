'use client';

import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import DatePicker from 'react-datepicker';
import { Euro } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

function useTransactions(date: Date | null, locale: string) {
  return useQuery({
    queryKey: ['transactions', date, locale],
    queryFn: async () => {
      const dateStr = date ? date.toISOString().slice(0, 10) : '';
      const r = await fetch(`/api/transactions?date=${dateStr}`, {
        cache: 'no-store',
      });
      if (!r.ok) throw new Error('Failed to load transactions');
      return r.json() as Promise<
        Array<{
          id: string;
          amount: number;
          type: 'INCOME' | 'EXPENSE';
          category: { name: string } | null;
          createdAt: string;
        }>
      >;
    },
  });
}

const LandingPage = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const locale = useLocale();
  const tTransaction = useTranslations('transactions');
  const tCategory = useTranslations('category');
  const { data: transactions, isLoading } = useTransactions(date, locale);

  if (isLoading) return <p>{tTransaction('loadingTransactions')}</p>;

  return (
    <div>
      <div className="relative z-50 mt-4">
        <DatePicker
          showIcon
          selected={date}
          onChange={d => setDate(d)}
          className="rounded-md border border-gray-200 p-2 bg-white"
        />
      </div>
      <div className="mt-4">
        {transactions?.map(transaction => (
          <div key={transaction.id}>
            <h3>
              {new Date(transaction.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </h3>
            <div className="border-b flex justify-between py-2">
              <span>
                {transaction.category?.name || `${tCategory('noCategory')}`}
              </span>
              {transaction.type === 'INCOME' ? (
                <span className="flex items-center text-green-500">
                  {transaction.amount.toString()}
                  <Euro size={16} className="ml-1" />
                </span>
              ) : (
                <span className="flex items-center text-red-500">
                  {transaction.amount.toString()}
                  <Euro size={16} className="ml-1" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
