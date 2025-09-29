import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

type CardProps = { title: string; icon: React.ReactNode; className?: string };

export const Card = ({ title, icon, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl bg-white text-card-foreground shadow w-full h-full shadow-[inset_0px_2px_4px_0px_rgba(0,_0,_0,_0.3)]',
        className
      )}
      {...props}
    >
      <div className="m-4 flex flex-col justify-center items-center">
        <div>{icon}</div>
        <h3>{title}</h3>
      </div>
    </div>
  );
};
