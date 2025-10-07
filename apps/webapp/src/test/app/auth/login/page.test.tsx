/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import LoginPage from '@/app/auth/login/page';

// Mock the auth module
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
}));

// Mock the LoginForm component
vi.mock('@/app/auth/_components', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form Component</div>,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  GalleryVerticalEnd: () => <div data-testid="gallery-icon">Gallery Icon</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login page when user is not authenticated', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null as any);

    render(await LoginPage());

    // Check if the logo and app name are present
    expect(screen.getByText('Fivt')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-icon')).toBeInTheDocument();
    
    // Check if LoginForm component is rendered
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Ensure redirect was not called
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should redirect authenticated user to locale page', async () => {
    const { auth } = await import('@/auth');
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      expires: '2024-12-31',
    };
    
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    await LoginPage();

    // Should redirect to locale page
    expect(redirect).toHaveBeenCalledWith('/en');
  });

  it('should handle different locales in redirect', async () => {
    const { auth } = await import('@/auth');
    const { getLocale } = await import('next-intl/server');
    
    const mockSession = {
      user: { id: 'user-123', email: 'test@example.com' },
      expires: '2024-12-31',
    };
    
    vi.mocked(auth).mockResolvedValue(mockSession as any);
    vi.mocked(getLocale).mockResolvedValue('fr');

    await LoginPage();

    // Should redirect to French locale page
    expect(redirect).toHaveBeenCalledWith('/fr');
  });

  it('should have correct page structure and styling', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null as any);

    const { container } = render(await LoginPage());

    // Check main container classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-muted', 'flex', 'min-h-svh', 'flex-col', 'items-center', 'justify-center');

    // Check for the logo link
    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', '#');
    expect(logoLink).toHaveClass('flex', 'items-center', 'gap-2', 'self-center', 'font-medium');
  });

  it('should have accessible logo with proper icon container', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null as any);

    render(await LoginPage());

    // Check icon container styling
    const iconContainer = screen.getByTestId('gallery-icon').parentElement;
    expect(iconContainer).toHaveClass(
      'bg-primary',
      'text-primary-foreground',
      'flex',
      'size-6',
      'items-center',
      'justify-center',
      'rounded-md'
    );
  });
});