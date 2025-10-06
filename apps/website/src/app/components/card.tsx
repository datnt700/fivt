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
        'rounded-lg shadow-lg p-3 border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        className
      )}
      {...other}
    >
      {header && <div className="p-1 border">{header}</div>}
      <div className={cn('p1', className)}>{children}</div>
    </div>
  );
};
