'use client';

import * as React from 'react';
import { Command, ArrowLeftRight, BotMessageSquare, LayoutDashboard } from 'lucide-react';
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  name?: string;
  image?: string;
  email?: string;
}

export function AdminSidebar({
  image,
  name,
  email,
  ...props
}: AppSidebarProps) {
  const tTransaction = useTranslations('transactions');
  const tNavigation = useTranslations('navigation');
  const navItems = [
    {
      name: tNavigation('dashboard'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: tTransaction('title'),
      url: '/transactions',
      icon: ArrowLeftRight,
    },
    {
      name: 'Chatbot',
      url: '/chatbot',
      icon: BotMessageSquare,
    },
  ];

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
