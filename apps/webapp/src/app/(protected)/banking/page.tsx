import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { BankingPageClient } from './banking-client';

export default async function BankingPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/login');
  }

  return <BankingPageClient />;
}