'use client';

import 'react-datepicker/dist/react-datepicker.css';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import DatePicker from 'react-datepicker';
import { Euro } from 'lucide-react';
import { ProfileCompletionGuard } from '@/components/profile-completion-banner';
import { QuickMetrics, ProfileOverviewCard, FIProgressBar } from '@/components/financial-profile-widgets';
import { useTransactions } from './_hooks/use-dashboard';

const LandingPage = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const locale = useLocale();
  const tTransaction = useTranslations('transactions');
  const tCategory = useTranslations('category');
  const { data: transactions, isLoading } = useTransactions(date, locale);

  if (isLoading) return <p>{tTransaction('loadingTransactions')}</p>;

  return (
    <ProfileCompletionGuard bannerVariant="card">
      <div className="space-y-8">
        {/* Financial Profile Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Financial Journey</h2>
          
          {/* Quick Metrics */}
          <div className="mb-8">
            <QuickMetrics />
          </div>

          {/* Profile Overview and Progress */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ProfileOverviewCard />
            <FIProgressBar />
          </div>
        </div>

        {/* Transactions Section */}
        <div>
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <div className="relative z-50 mb-4">
          <DatePicker
            showIcon
            selected={date}
            onChange={d => setDate(d)}
            className="rounded-md border border-gray-200 p-2 bg-white"
          />
        </div>
        <div className="grid gap-2">
          {transactions?.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div>
                <p className="font-medium">
                  {transaction.category?.name || `${tCategory('noCategory')}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {transaction.type === 'INCOME' ? (
                <span className="flex items-center text-green-600 font-semibold">
                  +{transaction.amount.toString()}
                  <Euro size={16} className="ml-1" />
                </span>
              ) : (
                <span className="flex items-center text-red-600 font-semibold">
                  -{transaction.amount.toString()}
                  <Euro size={16} className="ml-1" />
                </span>
              )}
            </div>
          ))}
          {(!transactions || transactions.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions found for this date.</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </ProfileCompletionGuard>
  );
};

export default LandingPage;