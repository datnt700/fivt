import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MagicLinkSignIn } from '@/app/auth/_components/magic-link-signin';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      signInButton: 'Sign in with Email',
      signingIn: 'Signing in...',
      checkEmail: 'Check your email',
      checkEmailDescription: 'We sent you a login link. Be sure to check your spam too.',
    };
    return translations[key] || key;
  }),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('MagicLinkSignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render email form initially', () => {
    render(<MagicLinkSignIn />);
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument();
  });

  it('should have proper form validation attributes', () => {
    render(<MagicLinkSignIn />);
    
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('should render with proper icons in submit button', () => {
    render(<MagicLinkSignIn />);
    
    // Check for Mail icon in submit button
    const submitButton = screen.getByRole('button', { name: /sign in with email/i });
    const mailIcon = submitButton.querySelector('svg');
    expect(mailIcon).toBeInTheDocument();
  });

  it('should render form elements with correct labels and placeholders', () => {
    render(<MagicLinkSignIn />);
    
    // Check that translation keys are being used correctly
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Email')).toBeInTheDocument();
  });

  it('should render email input with correct properties', () => {
    render(<MagicLinkSignIn />);
    
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveProperty('type', 'email');
    expect(emailInput).toHaveProperty('required', true);
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
  });

  it('should render submit button with Mail icon and text', () => {
    render(<MagicLinkSignIn />);
    
    const submitButton = screen.getByRole('button', { name: /sign in with email/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveProperty('type', 'submit');
    
    // Check that the button contains both icon and text
    const mailIcon = submitButton.querySelector('svg');
    expect(mailIcon).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('Sign in with Email');
  });
});