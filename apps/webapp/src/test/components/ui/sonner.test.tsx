import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ theme: 'light' })),
}));

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: vi.fn(({ theme, className, style, ...props }) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      className={className}
      style={style}
      {...props}
    />
  )),
}));

import { Toaster } from '@/components/ui/sonner';
import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster } from 'sonner';

const mockUseTheme = vi.mocked(useTheme);
const mockSonnerToaster = vi.mocked(SonnerToaster);

describe('Toaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    mockSonnerToaster.mockImplementation(({ theme, className, style, ...props }) => (
      <div
        data-testid="sonner-toaster"
        data-theme={theme}
        className={className}
        style={style}
        {...props}
      />
    ));
  });

  it('renders with default theme from useTheme', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' });
    
    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();
    expect(toaster).toHaveAttribute('data-theme', 'light');
    expect(toaster).toHaveClass('toaster group');
  });

  it('renders with dark theme', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark' });
    
    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'dark');
  });

  it('renders with system theme', () => {
    mockUseTheme.mockReturnValue({ theme: 'system' });
    
    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('uses system theme as default when theme is undefined', () => {
    mockUseTheme.mockReturnValue({ theme: undefined });
    
    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('data-theme', 'system');
  });

  it('applies correct CSS custom properties', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' });
    
    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    const style = toaster.style;
    
    expect(style.getPropertyValue('--normal-bg')).toBe('var(--popover)');
    expect(style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)');
    expect(style.getPropertyValue('--normal-border')).toBe('var(--border)');
  });

  it('passes through additional props', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' });
    
    render(<Toaster position="top-center" />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveAttribute('position', 'top-center');
  });

  it('calls useTheme hook', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' });
    
    render(<Toaster />);
    
    expect(mockUseTheme).toHaveBeenCalled();
  });

  it('renders with correct CSS classes and style', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark' });
    
    render(<Toaster />);
    
    const toaster = screen.getByTestId('sonner-toaster');
    expect(toaster).toHaveClass('toaster group');
    expect(toaster).toHaveAttribute('data-theme', 'dark');
    
    // Check that style object is passed correctly  
    const style = toaster.style;
    expect(style.getPropertyValue('--normal-bg')).toBe('var(--popover)');
    expect(style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)');
    expect(style.getPropertyValue('--normal-border')).toBe('var(--border)');
  });
});