import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from '@/app/components/loading';

describe('Loading Component', () => {
  it('should render loading spinner', () => {
    render(<Loading />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should have accessible loading text', () => {
    render(<Loading />);
    
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toBeInTheDocument();
  });

  it('should have proper SVG structure', () => {
    const { container } = render(<Loading />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('animate-spin');
  });

  it('should have correct accessibility attributes', () => {
    render(<Loading />);
    
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    
    const srText = screen.getByText('Loading...');
    expect(srText).toHaveClass('sr-only');
  });
});