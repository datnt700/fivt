import React from 'react';
import { cn } from '../lib/utils';

type Type = 'column' | 'row';

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  type?: Type;
  input: React.ReactNode;
  className?: string;
}
const Field = ({
  label,
  input,
  type = 'column',
  className,
  ...other
}: FieldProps) => {
  return (
    <div className={cn(type, className)} {...other}>
      <div>{label}</div>
      <div> {input} </div>
    </div>
  );
};

export default Field;
