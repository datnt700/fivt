import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTheme } from 'next-themes';
import * as React from 'react';
import ThemeToggler from '@/components/theme-toggler';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

const mockUseTheme = useTheme as MockedFunction<typeof useTheme>;

describe('ThemeToggler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('should render toggle button', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      resolvedTheme: 'light',
      forcedTheme: undefined,
      systemTheme: 'light',
      themes: ['light', 'dark'],
    });

    render(<ThemeToggler />);
    
    // Wait for component to mount
    const toggleButton = await screen.findByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('should render toggle button when mounted', async () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      resolvedTheme: 'light',
      forcedTheme: undefined,
      systemTheme: 'light',
      themes: ['light', 'dark'],
    });

    render(<ThemeToggler />);
    
    const toggleButton = await screen.findByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('should call setTheme with "dark" when current theme is light', async () => {
    const mockSetTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      forcedTheme: undefined,
      systemTheme: 'light',
      themes: ['light', 'dark'],
    });

    render(<ThemeToggler />);
    
    const toggleButton = await screen.findByRole('button');
    fireEvent.click(toggleButton);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "light" when current theme is dark', async () => {
    const mockSetTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      forcedTheme: undefined,
      systemTheme: 'dark',
      themes: ['light', 'dark'],
    });

    render(<ThemeToggler />);
    
    const toggleButton = await screen.findByRole('button');
    fireEvent.click(toggleButton);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});