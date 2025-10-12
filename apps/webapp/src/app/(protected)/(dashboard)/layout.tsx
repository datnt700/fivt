import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AdminSidebar, BottomNav } from '@/components/navigation';
import { ThemeToggler, LanguageSwitcher } from '@/components/theme';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 items-center gap-2 shrink-0">
          <div className="flex w-full items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <h3 className="text-xl font-medium">FIVT</h3>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggler />
            </div>
          </div>
        </header>

        <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4 pt-0 overflow-hidden">
          <div className="bg-muted/50 rounded-xl flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}