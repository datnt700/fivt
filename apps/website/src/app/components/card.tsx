import React from 'react';
import { cn } from '../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
}

export const Card = ({
  children,
  className,
  header,
  wrapperClassName,
  ...other
}: CardProps) => {
  return (
    <div
      className={cn(
        `bg-white shadow-[0px 4px 24.9px rgba(0, 109, 189, 0.1)] rounded-2xl border-gray-500`,
        wrapperClassName
      )}
      {...other}
    >
      {header && <div className="p-1 border">{header}</div>}
      <div className={cn('p1', className)}>{children}</div>
    </div>
  );
};
