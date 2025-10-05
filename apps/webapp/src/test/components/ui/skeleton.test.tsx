import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock the cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Skeleton', () => {
  it('should render skeleton with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  });

  it('should have default skeleton classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass(
      'bg-accent',
      'animate-pulse',
      'rounded-md'
    );
  });

  it('should accept custom className', () => {
    const customClass = 'custom-skeleton-class';
    render(<Skeleton className={customClass} data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass(customClass);
  });

  it('should forward additional props', () => {
    render(
      <Skeleton 
        data-testid="skeleton"
        data-custom="test-value" 
        aria-label="Loading skeleton"
      />
    );
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-custom', 'test-value');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading skeleton');
  });

  it('should call cn utility with correct classes', async () => {
    const { cn } = await import('@/lib/utils');
    const customClass = 'custom-class';
    
    render(<Skeleton className={customClass} data-testid="skeleton" />);
    
    expect(cn).toHaveBeenCalledWith(
      'bg-accent animate-pulse rounded-md',
      customClass
    );
  });

  it('should render as a div element', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
  });

  it('should have data-slot attribute for identification', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  });

  it('should work without className prop', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-accent', 'animate-pulse', 'rounded-md');
  });
});