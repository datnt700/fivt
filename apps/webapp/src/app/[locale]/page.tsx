"use client"

import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import DatePicker from 'react-datepicker';
import { Euro } from 'lucide-react';

const LandingPage = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [dataTransactions, setDataTransactions] = useState<any[]>([]);
  const locale = useLocale();


  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch(
        `/${locale}/api/transactions?date=${date?.toISOString()}`
      );
      const json = await res.json();
      setDataTransactions(json);
    };
    fetchTransactions();
  }, [date]);

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
        {dataTransactions.map(transaction => (
          <div key={transaction.id}>
            <h3>
              {new Date(transaction.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </h3>

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
    </div>
  );
};

export default LandingPage;
