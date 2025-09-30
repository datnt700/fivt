'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTransactionForm as BaseCreateTransactionForm } from './create-transaction-form';

export function CreateTransactionFormCard() {
  const t = useTranslations('transactions');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('addManualTitle')}</CardTitle>
        <CardDescription>
          {t('addManualSubtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BaseCreateTransactionForm />
      </CardContent>
    </Card>
  );
}