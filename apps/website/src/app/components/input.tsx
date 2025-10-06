import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

type InputVariant = 'default' | 'success' | 'warning' | 'danger';
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  errorMessage?: string;
  hasClearButton?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: InputVariant;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

const variantClasses: Record<InputVariant | 'disabled', string> = {
  default: cn('bg-[var(--light)]', 'border border-[var(--dark4)]'),
  success: cn(
    'bg-[var(--dark)]',
    'border border-[var(--color-green)]',
    '[box-shadow:0_0_3px_var(--color-green)]'
  ),
  warning: cn(
    'bg-[var(--dark)]',
    'border border-[var(--color-yellow)]',
    '[box-shadow:0_0_3px_var(--color-yellow)]'
  ),
  danger: cn(
    'border border-[var(--color-red)]',
    '[box-shadow:0_0_3px_var(--color-red)]',
    'focus-within:border-[var(--color-red)]'
  ),
  disabled: cn(
    'bg-[var(--dark4)]',
    'cursor-not-allowed opacity-60',
    // chặn tương tác với input con khi disabled
    '[&_.input]:pointer-events-none'
  ),
};

export const InputText = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      name,
      className,
      placeholder,
      value,
      onChange,
      errorMessage,
      hasClearButton,
      variant = 'default',
      isDisabled,
      isReadOnly,
      ...other
    },
    ref
  ) => {
    const finalVariant = isDisabled ? 'disabled' : variant;

    return (
      <div className={cn('flex flex-col gap-2 w-full', className)}>
        <div
          className={cn(
            // base wrapper
            'flex items-center',
            'rounded-[var(--border-radius-medium)]',
            'border border-[var(--input-border-color)]',
            // hiệu ứng focus-within gốc
            'focus-within:border-[var(--light4)]',
            'focus-within:[box-shadow:0_0_3px_var(--dark)]',
            // biến thể
            variantClasses[finalVariant]
          )}
        >
          <input
            type="text"
            id={id}
            name={name}
            placeholder={placeholder}
            data-testid="input"
            value={value}
            onChange={onChange}
            ref={ref}
            disabled={isDisabled}
            readOnly={isReadOnly}
            className={cn(
              'input', // để selector disabled tác dụng
              'outline-none',
              'text-[var(--dark)]',
              'px-4 py-2 w-full',
              'text-base',
              'rounded-[var(--border-radius-medium)]',
              'border-0',
              'bg-transparent',
              // placeholder
              'placeholder:font-light',
              'placeholder:leading-[30px]',
              'placeholder:text-[#6b6b6b]'
            )}
            {...other}
          />

          {/* {hasClearButton && (
            <Button
              variant="tertiary"
              shape="square"
              className={cn(
                'bg-transparent',
                'rounded-[var(--border-radius-medium)]',
                'text-[var(--light)]'
              )}
              icon={<X width={16} height={16} />}
              // bạn có thể thêm onClick để clear giá trị tại đây nếu muốn
            />
          )} */}
        </div>

        {errorMessage && (
          <span className="text-[var(--color-red)] text-xs font-semibold leading-normal">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);
InputText.displayName = 'InputText';
