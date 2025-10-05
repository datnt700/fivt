import React from 'react';
import { ReactNode } from 'react';
import { cn } from '@/app/lib/utils';

interface LayoutProps {
  background?: 'light' | 'gradient';
  className?: string;
  children: ReactNode;
}

const bgMap = {
  light: 'bg-white',
  gradient: 'bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee]',
} as const;

export const Layout = ({
  children,
  background = 'light',
  className,
}: LayoutProps) => {
  return <div className={cn(bgMap[background], className)}>{children}</div>;
};
