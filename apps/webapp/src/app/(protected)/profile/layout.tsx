/**
 * Profile Layout - Clean layout without sidebar for profile setup flow
 * This layout is used for /profile/setup and /profile/results routes
 * to provide a focused, distraction-free experience during profile creation
 * Note: This layout is nested inside the protected layout, so auth is already handled
 */

import { ThemeToggler } from '@/components/theme';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Clean header without sidebar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 md:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-medium">FIVT</h3>
          </div>
          <ThemeToggler />
        </div>
      </header>

      {/* Main content without sidebar constraints - allow natural scrolling */}
      <main className="w-full px-4 md:px-8 py-4 md:py-6">
        <div className="w-full max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}