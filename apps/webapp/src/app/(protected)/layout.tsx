import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ClientProviders from './client-provider';
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(`auth/login`);
  }

  return <ClientProviders>{children}</ClientProviders>;
}
