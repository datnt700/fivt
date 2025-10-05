import React from 'react';
import { labelStyles } from './Label.styles';
import { cn } from '../lib/utils';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
  required?: boolean;
}

export const Label = ({
  htmlFor,
  className,
  children,
  required,
}: LabelProps) => {
  const renderRequired = () =>
    required && <span className="text-orange-500"> *</span>;

  return children ? (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-[1rem] not-italic font-medium leading-[normal] flex items-center justify-between',
        className
      )}
    >
      <p className="text-[1rem] font-medium">
        <span>
          {children}
          {renderRequired()}
        </span>
      </p>
    </label>
  ) : null;
};
