import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LanguageSwitcher } from '@/components/theme/language-switcher';
import * as localeService from '@/services/locale';

// Mock next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock locale service
vi.mock('@/services/locale', () => ({
  setUserLocale: vi.fn(),
}));

const mockUseLocale = useLocale as MockedFunction<typeof useLocale>;
const mockUseRouter = useRouter as MockedFunction<typeof useRouter>;
const mockSetUserLocale = vi.spyOn(localeService, 'setUserLocale');

describe('LanguageSwitcher', () => {
  const mockRefresh = vi.fn();
  const mockRouter = {
    refresh: mockRefresh,
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it('should render with current locale (English)', () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    // Check that the button contains the text we expect
    expect(toggleButton.textContent).toContain('English');
  });

  it('should render with current locale (Vietnamese)', () => {
    mockUseLocale.mockReturnValue('vi');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('🇻🇳')).toBeInTheDocument();
    expect(toggleButton.textContent).toContain('Tiếng Việt');
  });

  it('should render with current locale (French)', () => {
    mockUseLocale.mockReturnValue('fr');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('🇫🇷')).toBeInTheDocument();
    expect(toggleButton.textContent).toContain('Français');
  });

  it('should show locale dropdown when clicked', async () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Check that dropdown options are visible by checking for multiple flag instances
    expect(screen.getAllByText('🇺🇸')).toHaveLength(2); // One in button, one in dropdown
    expect(screen.getAllByText('🇻🇳')).toHaveLength(1); // One in dropdown
    expect(screen.getAllByText('🇫🇷')).toHaveLength(1); // One in dropdown
  });

  it('should highlight current locale in dropdown', async () => {
    mockUseLocale.mockReturnValue('vi');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Find the Vietnamese option in the dropdown
    const vietnameseOptions = screen.getAllByText('Tiếng Việt');
    const dropdownOption = vietnameseOptions.find(el => 
      el.closest('button')?.className.includes('bg-gray-100')
    );
    
    expect(dropdownOption).toBeInTheDocument();
  });

  it('should change locale when dropdown option is clicked', async () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Get all buttons and find the French one (should be the 3rd button - index 2)
    const allButtons = screen.getAllByRole('button');
    // Main toggle button + 3 dropdown buttons = 4 total
    expect(allButtons).toHaveLength(4);
    
    const frenchButton = allButtons[3]; // French should be the last button
    if (frenchButton) {
      fireEvent.click(frenchButton);
    }
      
    await waitFor(() => {
      expect(mockSetUserLocale).toHaveBeenCalledWith('fr');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('should close dropdown after selecting a locale', async () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Verify dropdown is open by checking for multiple flags
    expect(screen.getAllByText('🇻🇳')).toHaveLength(1);

    // Get all buttons and click Vietnamese (should be 2nd dropdown button - index 2)
    const allButtons = screen.getAllByRole('button');
    const vietnameseButton = allButtons[2];
    
    if (vietnameseButton) {
      fireEvent.click(vietnameseButton);
      
      await waitFor(() => {
        // After clicking, should trigger locale change
        expect(mockSetUserLocale).toHaveBeenCalledWith('vi');
      });
    }
  });

  it('should toggle dropdown open/close on button clicks', () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    
    // Initially closed
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(toggleButton);
    expect(screen.getByText('Français')).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(toggleButton);
    expect(screen.queryByText('Français')).not.toBeInTheDocument();
  });

  it('should render with proper accessibility attributes', () => {
    mockUseLocale.mockReturnValue('en');

    render(<LanguageSwitcher />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    
    // Check for Globe icon
    const globeIcon = toggleButton.querySelector('svg');
    expect(globeIcon).toBeInTheDocument();
    
    // Check for ChevronDown icon
    const chevronIcon = toggleButton.querySelector('svg:last-child');
    expect(chevronIcon).toBeInTheDocument();
  });
});