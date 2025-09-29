import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AdminSidebar, BottomNav } from '@/components/navigation';
import { ThemeToggler } from '@/components/theme';
import ClientProviders from './client-provider';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <ClientProviders>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-16 items-center gap-2">
            <div className="flex w-full items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <h3 className="text-xl font-medium">FIVT</h3>
              </div>
              <ThemeToggler />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-4">
              {children}
            </div>
          </div>
        </SidebarInset>
        <BottomNav />
      </SidebarProvider>
    </ClientProviders>
  );
}