import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import BowensBankingClient from './bowens-client';

export default async function BowensBankingPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return <BowensBankingClient />;
}