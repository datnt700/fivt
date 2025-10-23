import { ThemeToggler, LanguageSwitcher } from '@/components/theme';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Home, TrendingUp } from 'lucide-react';

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/community" className="flex items-center space-x-2">
              <span className="text-xl font-bold">FIVT Community</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link
                href="/community"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                <Home className="inline-block mr-1 h-4 w-4" />
                Feed
              </Link>
              <Link
                href="/community/trending"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                <TrendingUp className="inline-block mr-1 h-4 w-4" />
                Trending
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggler />
            <Link href="/dashboard" className="text-sm font-medium">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-6 px-4">{children}</div>
      </main>
    </div>
  );
}
