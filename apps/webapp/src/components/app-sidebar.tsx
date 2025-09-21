'use client';

import * as React from 'react';
import { Command, DollarSign, LayoutDashboard, Users, CreditCard, Building2,ArrowLeftRight, BotMessageSquare} from 'lucide-react';
import { NavItems } from '@/components/nav-items';
import { NavUser } from '@/components/nav-user';
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
import { useLocale } from 'next-intl';


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  name?: string;
  image?: string;
  email?: string;
}

export function AdminSidebar({ image, name, email, ...props }: AppSidebarProps) {

  const locale = useLocale();

  const data = [
    {
      name: 'Transaction',
      url: `/${locale}/transactions`,
      icon: ArrowLeftRight,
    },
    {
      name: 'Chatbot',
      url: `/${locale}/chatbot`,
      icon: BotMessageSquare,
    },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Admin Panel</span>
                  <span className="truncate text-xs">TrackStack</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={data} />
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
