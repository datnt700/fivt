import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileCompletionBanner, useProfileCompletion, ProfileCompletionGuard } from '@/components/profile-completion-banner';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      profileIncomplete: 'Profile Incomplete',
      completeSetup: 'Complete Setup',
      title: 'Complete Your Financial Profile',
      description: 'Get personalized insights and track your progress.',
      trackSavings: 'Track Savings',
      monitorProgress: 'Monitor Progress',
      getStarted: 'Get Started',
      setupProfile: 'Setup Profile',
    };
    return translations[key] || key;
  }),
}));

// Mock financial profile context
vi.mock('@/contexts/financial-profile-context', () => ({
  useProfileStatus: vi.fn(),
}));

// Mock routes config
vi.mock('@/config/routes', () => ({
  FLAT_ROUTES: {
    PROFILE_SETUP: '/profile/setup',
  },
}));

import { useRouter } from 'next/navigation';
import { useProfileStatus } from '@/contexts/financial-profile-context';

const mockUseRouter = vi.mocked(useRouter);
const mockUseProfileStatus = vi.mocked(useProfileStatus);

describe('ProfileCompletionBanner', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({ 
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn()
    });
  });

  describe('Visibility Logic', () => {
    it('should not render when loading', () => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: true,
        isLoading: true,
        isProfileOutdated: false,
        error: null,
      });

      const { container } = render(<ProfileCompletionBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when user has profile', () => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: true,
        needsProfile: false,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });

      const { container } = render(<ProfileCompletionBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when profile is not needed', () => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: false,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });

      const { container } = render(<ProfileCompletionBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when profile is needed and not loading', () => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: true,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });

      render(<ProfileCompletionBanner />);
      expect(screen.getByText('Setup Profile')).toBeInTheDocument();
    });
  });

  describe('Banner Variant (default)', () => {
    beforeEach(() => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: true,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });
    });

    it('should render with default banner variant', () => {
      render(<ProfileCompletionBanner />);
      
      expect(screen.getByText('Setup Profile')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /setup profile/i })).toBeInTheDocument();
    });

    it('should show dismiss button by default', () => {
      render(<ProfileCompletionBanner />);
      
      const dismissButton = screen.getByRole('button', { name: '' }); // X button has no text
      expect(dismissButton).toBeInTheDocument();
    });

    it('should navigate to profile setup on button click', () => {
      render(<ProfileCompletionBanner />);
      
      const setupButton = screen.getByRole('button', { name: /setup profile/i });
      fireEvent.click(setupButton);
      
      expect(mockPush).toHaveBeenCalledWith('/profile/setup');
    });

    it('should dismiss banner when X is clicked', () => {
      render(<ProfileCompletionBanner />);
      
      const dismissButton = screen.getByRole('button', { name: '' }); // X button
      fireEvent.click(dismissButton);
      
      // Banner should be removed from DOM
      expect(screen.queryByText('Setup Profile')).not.toBeInTheDocument();
    });
  });

  describe('Minimal Variant', () => {
    beforeEach(() => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: true,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });
    });

    it('should render minimal variant', () => {
      render(<ProfileCompletionBanner variant="minimal" />);
      
      expect(screen.getByText('Profile Incomplete')).toBeInTheDocument();
      expect(screen.getByText('Complete Setup')).toBeInTheDocument();
    });

    it('should navigate on complete setup click', () => {
      render(<ProfileCompletionBanner variant="minimal" />);
      
      const completeButton = screen.getByRole('button', { name: /complete setup/i });
      fireEvent.click(completeButton);
      
      expect(mockPush).toHaveBeenCalledWith('/profile/setup');
    });
  });

  describe('Card Variant', () => {
    beforeEach(() => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: true,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });
    });

    it('should render card variant with full content', () => {
      render(<ProfileCompletionBanner variant="card" />);
      
      expect(screen.getByText('Complete Your Financial Profile')).toBeInTheDocument();
      expect(screen.getByText('Get personalized insights and track your progress.')).toBeInTheDocument();
      expect(screen.getByText('Track Savings')).toBeInTheDocument();
      expect(screen.getByText('Monitor Progress')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should navigate on get started click', () => {
      render(<ProfileCompletionBanner variant="card" />);
      
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      fireEvent.click(getStartedButton);
      
      expect(mockPush).toHaveBeenCalledWith('/profile/setup');
    });

    it('should hide dismiss button when showDismiss is false', () => {
      render(<ProfileCompletionBanner variant="card" showDismiss={false} />);
      
      // Should not have X button
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1); // Only "Get Started" button
      expect(buttons[0]).toHaveTextContent('Get Started');
    });
  });

  describe('Custom Props', () => {
    beforeEach(() => {
      mockUseProfileStatus.mockReturnValue({
        hasProfile: false,
        needsProfile: true,
        isLoading: false,
        isProfileOutdated: false,
        error: null,
      });
    });

    it('should apply custom className', () => {
      const { container } = render(<ProfileCompletionBanner className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

describe('useProfileCompletion', () => {
  it('should return correct completion status when profile exists', () => {
    mockUseProfileStatus.mockReturnValue({
      hasProfile: true,
      needsProfile: false,
      isLoading: false,
      isProfileOutdated: false,
      error: null,
    });

    const TestComponent = () => {
      const completion = useProfileCompletion();
      return (
        <div>
          <span data-testid="complete">{completion.isComplete.toString()}</span>
          <span data-testid="needs">{completion.needsCompletion.toString()}</span>
          <span data-testid="percentage">{completion.completionPercentage}</span>
          <span data-testid="banner">{completion.canShowBanner.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('complete')).toHaveTextContent('true');
    expect(screen.getByTestId('needs')).toHaveTextContent('false');
    expect(screen.getByTestId('percentage')).toHaveTextContent('100');
    expect(screen.getByTestId('banner')).toHaveTextContent('false');
  });

  it('should return correct completion status when profile is needed', () => {
    mockUseProfileStatus.mockReturnValue({
      hasProfile: false,
      needsProfile: true,
      isLoading: false,
      isProfileOutdated: false,
      error: null,
    });

    const TestComponent = () => {
      const completion = useProfileCompletion();
      return (
        <div>
          <span data-testid="complete">{completion.isComplete.toString()}</span>
          <span data-testid="needs">{completion.needsCompletion.toString()}</span>
          <span data-testid="percentage">{completion.completionPercentage}</span>
          <span data-testid="banner">{completion.canShowBanner.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('complete')).toHaveTextContent('false');
    expect(screen.getByTestId('needs')).toHaveTextContent('true');
    expect(screen.getByTestId('percentage')).toHaveTextContent('0');
    expect(screen.getByTestId('banner')).toHaveTextContent('true');
  });
});

describe('ProfileCompletionGuard', () => {
  it('should render children with banner when profile is needed', () => {
    mockUseProfileStatus.mockReturnValue({
      hasProfile: false,
      needsProfile: true,
      isLoading: false,
      isProfileOutdated: false,
      error: null,
    });

    render(
      <ProfileCompletionGuard>
        <div data-testid="child-content">Child Content</div>
      </ProfileCompletionGuard>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Setup Profile')).toBeInTheDocument();
  });

  it('should render only children when banner is disabled', () => {
    mockUseProfileStatus.mockReturnValue({
      hasProfile: false,
      needsProfile: true,
      isLoading: false,
      isProfileOutdated: false,
      error: null,
    });

    render(
      <ProfileCompletionGuard showBanner={false}>
        <div data-testid="child-content">Child Content</div>
      </ProfileCompletionGuard>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Setup Profile')).not.toBeInTheDocument();
  });

  it('should render children without banner when profile is complete', () => {
    mockUseProfileStatus.mockReturnValue({
      hasProfile: true,
      needsProfile: false,
      isLoading: false,
      isProfileOutdated: false,
      error: null,
    });

    render(
      <ProfileCompletionGuard>
        <div data-testid="child-content">Child Content</div>
      </ProfileCompletionGuard>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByText('Setup Profile')).not.toBeInTheDocument();
  });
});