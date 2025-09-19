'use client';
import { CreateTransitionForm } from './create/CreateTransactionForm';
import { prisma } from '@/lib/prisma';
import { Euro } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { useEffect, useState } from 'react';
export default function Page() {
  const [date, setDate] = useState<Date | null>(null);
  const [dataTransactions, setDataTransactions] = useState<any[]>([]);

  useEffect(() => {
    dataTransactions;
  }, [dataTransactions]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(
        `/api/transactions?date=${(date || new Date()).toISOString()}`
      );
      const json = await res.json();
      setDataTransactions(json);
    };
    fetchTransactions();
  }, [date]);

  return (
    <>
      <CreateTransitionForm />
      <DatePicker
        selected={date}
        onChange={date => setDate(date)}
        showTimeSelect
      />
      <div className="mt-4">
        {dataTransactions.map(transaction => (
          <div key={transaction.id}>
            <h3>{transaction.createdAt.toLocaleDateString()}</h3>
            <div className="border-b flex justify-between py-2">
              <span>{transaction.category?.name || 'No Category'}</span>

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
    </>
  );
}
