'use client';

import * as React from 'react';
import {
  Command,
  ArrowLeftRight,
  BotMessageSquare,
  LayoutDashboard,
  PiggyBank,
  Banknote,
} from 'lucide-react';
import { NavItems } from './nav-items';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAccessibleServices } from '@/hooks/use-subscriptions';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  name?: string;
  image?: string;
  email?: string;
}

export function AppSidebar({ image, name, email, ...props }: AppSidebarProps) {
  const tTransaction = useTranslations('transactions');
  const tNavigation = useTranslations('navigation');
  const tBudget = useTranslations('budget');
  const tBanking = useTranslations('banking');
  const tExtensions = useTranslations('extensions');
  const tChatbot = useTranslations('chatbot');

  const { services, isLoading, hasService } = useAccessibleServices();

  // Define all possible navigation items with their service requirements
  const allNavItems = [
    {
      name: tNavigation('dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
      serviceType: 'DASHBOARD' as const,
      alwaysShow: true, // Dashboard might be available to all users
    },
    {
      name: tTransaction('title'),
      url: '/transactions',
      icon: ArrowLeftRight,
      serviceType: 'TRANSACTION_MANAGEMENT' as const,
    },
    {
      name: tBudget('title'),
      url: '/budget',
      icon: PiggyBank,
      serviceType: 'BUDGET_TRACKING' as const,
    },
    {
      name: tBanking('title'),
      url: '/banking',
      icon: Banknote,
      serviceType: 'BANKING_INTEGRATION' as const,
    },
    {
      name: tChatbot('title'),
      url: '/chatbot',
      icon: BotMessageSquare,
      serviceType: 'AI_CHATBOT' as const,
    },
  ];

  // Filter navigation items based on user's subscriptions
  const navItems = allNavItems.filter(
    item => item.alwaysShow || hasService(item.serviceType)
  );

  if (isLoading) {
    return (
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">FIVT</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
            </div>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <NavUser
            user={{
              name: name || '',
              email: email || '',
              avatar: image || '',
            }}
          />
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">FIVT</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={navItems} />

        {/* Show upgrade prompt if user has limited services */}
        {services.length < allNavItems.length - 1 && (
          <div className="p-4">
            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3 text-sm">
              <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                {tExtensions('sidebar.unlockFeatures')}
              </p>
              <p className="text-orange-700 dark:text-orange-300 text-xs mb-2">
                {tExtensions('sidebar.subscribeToAccess', {
                  count: allNavItems.length - services.length - 1,
                })}
              </p>
              <Link
                href="/extensions"
                className="text-orange-800 dark:text-orange-200 underline text-xs font-medium"
              >
                {tExtensions('sidebar.viewPlans')}
              </Link>
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: name || '',
            email: email || '',
            avatar: image || '',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
