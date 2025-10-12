import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/textarea';

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Textarea', () => {
  it('should render textarea with default props', () => {
    render(<Textarea data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should have default textarea classes', () => {
    render(<Textarea data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass(
      'border-input',
      'placeholder:text-muted-foreground',
      'focus-visible:border-ring',
      'min-h-16',
      'w-full',
      'rounded-md',
      'border',
      'bg-transparent',
      'px-3',
      'py-2'
    );
  });

  it('should accept custom className', () => {
    const customClass = 'custom-textarea-class';
    render(<Textarea className={customClass} data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass(customClass);
  });

  it('should forward textarea-specific props', () => {
    render(
      <Textarea 
        data-testid="textarea"
        placeholder="Enter your message"
        rows={5}
        cols={30}
        maxLength={100}
        disabled
      />
    );
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('placeholder', 'Enter your message');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '30');
    expect(textarea).toHaveAttribute('maxlength', '100');
    expect(textarea).toBeDisabled();
  });

  it('should accept ref prop', () => {
    const ref = { current: null };
    render(<Textarea ref={ref} data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('should handle value and onChange props', () => {
    const handleChange = vi.fn();
    const value = 'test value';
    
    render(
      <Textarea 
        data-testid="textarea"
        value={value}
        onChange={handleChange}
      />
    );
    
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(value);
  });

  it('should call cn utility with correct classes', async () => {
    const { cn } = await import('@/lib/utils');
    const customClass = 'custom-class';
    
    render(<Textarea className={customClass} data-testid="textarea" />);
    
    expect(cn).toHaveBeenCalledWith(
      'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      customClass
    );
  });

  it('should have data-slot attribute for identification', () => {
    render(<Textarea data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  it('should work without className prop', () => {
    render(<Textarea data-testid="textarea" />);
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('min-h-16', 'w-full', 'rounded-md');
  });

  it('should support form-related props', () => {
    render(
      <Textarea 
        data-testid="textarea"
        name="message"
        id="message-field"
        required
        autoComplete="off"
        form="my-form"
      />
    );
    
    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('name', 'message');
    expect(textarea).toHaveAttribute('id', 'message-field');
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute('autocomplete', 'off');
    expect(textarea).toHaveAttribute('form', 'my-form');
  });
});