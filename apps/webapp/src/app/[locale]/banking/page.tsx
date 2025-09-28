import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BankingPageClient } from '@/app/[locale]/banking/banking-client';

export default async function BankingPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  return <BankingPageClient />;
}