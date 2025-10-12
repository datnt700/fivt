import React from 'react';
import { cn } from '../lib/utils';

type Variant =
  | 'base'
  | 'inherit'
  | 'primary'
  | 'info'
  | 'success'
  | 'caution'
  | 'warning'
  | 'danger';

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  source: string | React.ReactNode;
  variant?: Variant;
}

const variantSvgClass: Partial<Record<Variant, string>> = {
  info: '[&_svg]:text-blue-600',
  danger: '[&_svg]:text-red-600',
  primary: '[&_svg]:text-orange-600',
  success: '[&_svg]:text-green-600',
  caution: '[&_svg]:text-amber-600',
  warning: '[&_svg]:text-yellow-600',
};

export const Icon = ({
  source,
  variant = 'base',
  className,
  ...other
}: IconProps) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center w-max h-max',
        variantSvgClass[variant],
        className
      )}
      {...other}
    >
      {typeof source === 'string' ? (
        <img src={`data:image/svg+xml;utf8,${source}`} alt="" />
      ) : (
        source
      )}
    </div>
  );
};
