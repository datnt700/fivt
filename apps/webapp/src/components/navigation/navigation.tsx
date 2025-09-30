'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggler } from '@/components/theme';
import { LanguageSwitcher } from '@/components/theme';
import { ProfileStatusIndicator } from '@/components/financial-profile-widgets';
import { 
  Home, 
  MessageSquare, 
  CreditCard, 
  Receipt,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FLAT_ROUTES } from '@/config/routes';

export function Navigation() {
  const t = useTranslations('navigation');
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      href: FLAT_ROUTES.HOME,
      label: 'home',
      icon: Home,
    },
    {
      href: FLAT_ROUTES.PROFILE_SETUP,
      label: 'profile',
      icon: User,
    },
    {
      href: FLAT_ROUTES.CHATBOT,
      label: 'chatbot',
      icon: MessageSquare,
    },
    {
      href: FLAT_ROUTES.BANKING,
      label: 'banking',
      icon: CreditCard,
    },
    {
      href: FLAT_ROUTES.TRANSACTIONS,
      label: 'transactions',
      icon: Receipt,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: FLAT_ROUTES.HOME });
  };

  if (!session) {
    return null;
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href={FLAT_ROUTES.HOME} className="text-xl font-bold">
              Fivt
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith(item.href === '/' ? '/dashboard' : item.href) ? 'text-primary' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(item.label)}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center space-x-4">
            <ProfileStatusIndicator />
            <ThemeToggler />
            <LanguageSwitcher />
            {session.user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {session.user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium py-2 px-4 rounded-md hover:bg-accent ${
                      pathname.startsWith(item.href === '/' ? '/dashboard' : item.href) ? 'bg-accent' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(item.label)}</span>
                  </Link>
                );
              })}
              <div className="px-4 py-2 space-y-2">
                <div className="flex items-center justify-center">
                  <ProfileStatusIndicator />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThemeToggler />
                    <LanguageSwitcher />
                  </div>
                  {session.user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}