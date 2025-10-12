/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerifyRequestPage from '@/app/auth/verify-request/page';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card-content" className={className}>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => 
    <p data-testid="card-description">{children}</p>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => 
    <h1 data-testid="card-title">{children}</h1>,
}));

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Mail: ({ className }: { className?: string }) => 
    <div data-testid="mail-icon" className={className}>Mail Icon</div>,
}));

describe('VerifyRequestPage', () => {
  const mockTranslations = {
    checkEmail: 'Check Your Email',
    checkEmailDescription: 'We have sent you a magic link to sign in',
    hint: 'Click the link in the email to sign in to your account',
    bullets: {
      expire: 'Magic link expires in 24 hours',
      spam: 'Check your spam folder if you don\'t see the email',
      checkEmail: 'Make sure to check the correct email address',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render verify request page with correct content', async () => {
    const { getTranslations } = await import('next-intl/server');
    const mockT = vi.fn((key: string, params?: any) => {
      switch (key) {
        case 'checkEmail':
          return mockTranslations.checkEmail;
        case 'checkEmailDescription':
          return mockTranslations.checkEmailDescription;
        case 'hint':
          return mockTranslations.hint;
        case 'bullets.expire':
          return `Magic link expires in ${params?.hours} hours`;
        case 'bullets.spam':
          return mockTranslations.bullets.spam;
        case 'bullets.checkEmail':
          return mockTranslations.bullets.checkEmail;
        default:
          return key;
      }
    });
    
    vi.mocked(getTranslations).mockResolvedValue(mockT as any);

    render(await VerifyRequestPage());

    // Check main elements are present
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toBeInTheDocument();
    expect(screen.getByTestId('card-description')).toBeInTheDocument();

    // Check content
    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    expect(screen.getByText('We have sent you a magic link to sign in')).toBeInTheDocument();
    expect(screen.getByText('Click the link in the email to sign in to your account')).toBeInTheDocument();
  });

  it('should display translation keys correctly', async () => {
    const { getTranslations } = await import('next-intl/server');
    const mockT = vi.fn((key: string) => `translated-${key}`);
    
    vi.mocked(getTranslations).mockResolvedValue(mockT as any);

    render(await VerifyRequestPage());

    expect(mockT).toHaveBeenCalledWith('checkEmail');
    expect(mockT).toHaveBeenCalledWith('checkEmailDescription');
    expect(mockT).toHaveBeenCalledWith('hint');
  });

  it('should handle bullet points with parameters', async () => {
    const { getTranslations } = await import('next-intl/server');
    const mockT = vi.fn((key: string, params?: any) => {
      switch (key) {
        case 'bullets.expire':
          return `Expires in ${params?.hours} hours`;
        case 'bullets.spam':
          return 'Check spam folder';
        case 'bullets.checkEmail':
          return 'Verify email address';
        default:
          return key;
      }
    });
    
    vi.mocked(getTranslations).mockResolvedValue(mockT as any);

    render(await VerifyRequestPage());

    expect(mockT).toHaveBeenCalledWith('bullets.expire', { hours: 24 });
    expect(mockT).toHaveBeenCalledWith('bullets.spam');
    expect(mockT).toHaveBeenCalledWith('bullets.checkEmail');
    
    // Check rendered bullet points
    expect(screen.getByText('• Expires in 24 hours')).toBeInTheDocument();
    expect(screen.getByText('• Check spam folder')).toBeInTheDocument();
    expect(screen.getByText('• Verify email address')).toBeInTheDocument();
  });

  it('should have correct page structure and styling', async () => {
    const { getTranslations } = await import('next-intl/server');
    const mockT = vi.fn((key: string) => key);
    
    vi.mocked(getTranslations).mockResolvedValue(mockT as any);

    const { container } = render(await VerifyRequestPage());

    // Check main container classes
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-50', 'px-4');

    // Check card classes
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('w-full', 'max-w-md', 'mx-auto');

    // Check header classes
    const cardHeader = screen.getByTestId('card-header');
    expect(cardHeader).toHaveClass('text-center');

    // Check content classes
    const cardContent = screen.getByTestId('card-content');
    expect(cardContent).toHaveClass('text-center', 'space-y-4');
  });

  it('should have accessible mail icon with proper styling', async () => {
    const { getTranslations } = await import('next-intl/server');
    const mockT = vi.fn((key: string) => key);
    
    vi.mocked(getTranslations).mockResolvedValue(mockT as any);

    render(await VerifyRequestPage());

    const mailIcon = screen.getByTestId('mail-icon');
    expect(mailIcon).toHaveClass('w-6', 'h-6', 'text-green-600');
    
    // Check icon container styling
    const iconContainer = mailIcon.parentElement;
    expect(iconContainer).toHaveClass(
      'mx-auto',
      'mb-4',
      'w-12',
      'h-12',
      'bg-green-100',
      'rounded-full',
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('should call getTranslations with auth namespace', async () => {
    const { getTranslations } = await import('next-intl/server');
    const mockT = vi.fn((key: string) => key);
    
    vi.mocked(getTranslations).mockResolvedValue(mockT as any);

    await VerifyRequestPage();

    expect(getTranslations).toHaveBeenCalledWith('auth');
  });
});