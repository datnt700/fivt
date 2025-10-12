'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ManualTransactionsList } from '../transactions/_components';
import { useTransactions } from './_hooks/use-transaction';
import 'react-datepicker/dist/react-datepicker.css';
import { CreateTransactionModal } from './_components/create-transaction-modal';

export default function BudgetPage() {
  const t = useTranslations('budget');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch manual transactions
  const {
    data: manualTransactions,
    isLoading: manualLoading,
    error: manualError,
  } = useTransactions();

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </div>
          {/* Manual Transaction Creation */}
          {/* <CreateTransactionFormCard /> */}
          <CreateTransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>

        {/* Manual Transactions List */}
        <ManualTransactionsList
          transactions={manualTransactions}
          loading={manualLoading}
          error={manualError}
          openCreateTransactionModal={() => setIsModalOpen(true)}
        />
      </div>
    </div>
  );
}
