import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import PowensBankingClient from './powens-client';

export default async function PowensBankingPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return <PowensBankingClient />;
}