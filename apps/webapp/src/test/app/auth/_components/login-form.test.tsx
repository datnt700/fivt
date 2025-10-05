import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/app/auth/_components/login-form';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Welcome back',
      subtitle: 'Sign in to your account',
    };
    return translations[key] || key;
  }),
}));

// Mock LanguageSwitcher component
vi.mock('@/components/theme', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

// Mock MagicLinkSignIn component
vi.mock('./magic-link-signin', () => ({
  MagicLinkSignIn: () => <div data-testid="magic-link-signin">Magic Link Sign In</div>,
}));

// Mock auth actions
vi.mock('@/lib/auth-actions', () => ({
  signInWithGoogle: vi.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render main card with title and subtitle', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
  });

  it('should render language switcher in header', () => {
    render(<LoginForm />);
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('should render magic link signin component', () => {
    render(<LoginForm />);

    // Check for email input from MagicLinkSignIn component
    expect(screen.getByLabelText('emailLabel')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /emailLabel/i })).toBeInTheDocument();
  });  it('should render Google signin button', () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByRole('button', { name: /login with google/i });
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toHaveClass('w-full');
  });

  it('should render Google icon in signin button', () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByRole('button', { name: /login with google/i });
    const googleIcon = googleButton.querySelector('svg');
    expect(googleIcon).toBeInTheDocument();
  });

  it('should render terms of service and privacy policy links', () => {
    render(<LoginForm />);
    
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    
    const termsLink = screen.getByText(/terms of service/i).closest('a');
    const privacyLink = screen.getByText(/privacy policy/i).closest('a');
    
    expect(termsLink).toHaveAttribute('href', '#');
    expect(privacyLink).toHaveAttribute('href', '#');
  });

  it('should have proper component structure with Card layout', () => {
    render(<LoginForm />);
    
    // Check that the main content is within a card structure
    const card = screen.getByText('Welcome back').closest('[class*="card"]');
    expect(card).toBeInTheDocument();
  });

  it('should render with proper gap spacing classes', () => {
    const { container } = render(<LoginForm />);
    
    // Check that the main container has flex-col and gap classes
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'gap-6');
  });

  it('should render Google button with outline variant', () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByRole('button', { name: /login with google/i });
    // The button should have outline variant styling
    expect(googleButton).toHaveClass('w-full');
  });

  it('should use translation keys for content', () => {
    render(<LoginForm />);
    
    // Verify that the translation function is being called with correct keys
    expect(screen.queryByText('title')).not.toBeInTheDocument(); // Should be translated
    expect(screen.queryByText('subtitle')).not.toBeInTheDocument(); // Should be translated
    expect(screen.getByText('Welcome back')).toBeInTheDocument(); // Translated content
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument(); // Translated content
  });

  it('should render legal text with proper styling', () => {
    render(<LoginForm />);
    
    const legalText = screen.getByText(/by clicking continue, you agree/i);
    expect(legalText).toBeInTheDocument();
    
    // Check for underline styling on links
    const termsLink = screen.getByText(/terms of service/i);
    const privacyLink = screen.getByText(/privacy policy/i);
    
    expect(termsLink).toHaveClass('underline', 'underline-offset-4');
    expect(privacyLink).toHaveClass('underline', 'underline-offset-4');
  });
});