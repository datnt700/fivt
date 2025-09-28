'use client';
import { useTranslations } from 'next-intl';

export default function LocaleNotFound() {
  const t = useTranslations('errors');
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="mt-2 text-muted-foreground">{t('notFound')}</p>
    </main>
  );
}
