'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[];
  label?: string;
}

export function RadioGroup({
  label,
  options,
  className,
  ...props
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {label && <p className="font-medium">{label}</p>}
      <RadioGroupPrimitive.Root
        className={cn('flex flex-col gap-2', className)}
        {...props}
      >
        {options.map(opt => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupPrimitive.Item
              value={opt.value}
              id={`${props.name}-${opt.value}`}
              className={cn(
                'peer h-4 w-4 rounded-full border border-primary text-primary ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'data-[state=checked]:bg-primary data-[state=checked]:border-primary'
              )}
            >
              <RadioGroupPrimitive.Indicator className="flex items-center justify-center relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white" />
            </RadioGroupPrimitive.Item>
            <label
              htmlFor={`${props.name}-${opt.value}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}
