import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

// Mock @radix-ui/react-separator
vi.mock('@radix-ui/react-separator', () => ({
  Root: ({ children, className, orientation, decorative, ...props }: {
    children?: React.ReactNode;
    className?: string;
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    [key: string]: unknown;
  }) => (
    <div 
      data-testid="separator-root"
      data-orientation={orientation}
      data-decorative={decorative}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Separator', () => {
  it('should render separator with default props', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-decorative', 'true');
    expect(separator).toHaveAttribute('data-slot', 'separator');
  });

  it('should render separator with horizontal orientation by default', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveClass(
      'bg-border',
      'shrink-0',
      'data-[orientation=horizontal]:h-px',
      'data-[orientation=horizontal]:w-full',
      'data-[orientation=vertical]:h-full',
      'data-[orientation=vertical]:w-px'
    );
  });

  it('should render separator with vertical orientation', () => {
    render(<Separator orientation="vertical" />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should accept custom className', () => {
    const customClass = 'custom-separator-class';
    render(<Separator className={customClass} />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveClass(customClass);
  });

  it('should accept decorative prop', () => {
    render(<Separator decorative={false} />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-decorative', 'false');
  });

  it('should forward additional props', () => {
    render(<Separator data-custom="test-value" aria-label="Test separator" />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-custom', 'test-value');
    expect(separator).toHaveAttribute('aria-label', 'Test separator');
  });

  it('should call cn utility with correct classes', async () => {
    const { cn } = await import('@/lib/utils');
    const customClass = 'custom-class';
    
    render(<Separator className={customClass} />);
    
    expect(cn).toHaveBeenCalledWith(
      'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
      customClass
    );
  });

  it('should have data-slot attribute for identification', () => {
    render(<Separator />);
    
    const separator = screen.getByTestId('separator-root');
    expect(separator).toHaveAttribute('data-slot', 'separator');
  });
});