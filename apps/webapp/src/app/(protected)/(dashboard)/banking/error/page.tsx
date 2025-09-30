import { Suspense } from 'react';
import { BankingErrorClient } from './banking-error-client';

export default function BankingErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BankingErrorClient />
    </Suspense>
  );
}