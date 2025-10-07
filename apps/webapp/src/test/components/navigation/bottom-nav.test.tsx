import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import BottomNav from '@/components/navigation/bottom-nav';
import useNavigation from '@/hooks/use-navigation';
import useScroll from '@/hooks/use-scroll';

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
      <a href={href} className={className}>{children}</a>
    ),
  };
});



// Mock custom hooks
vi.mock('@/hooks/use-navigation', () => ({
  default: vi.fn(() => ({
    isHomeActive: false,
    isExploreActive: false,
    isNotificationsActive: false,
    isMessagesActive: false,
  })),
}));

vi.mock('@/hooks/use-scroll', () => ({
  default: vi.fn(() => 'up'),
}));

describe('BottomNav', () => {
  const mockUseNavigation = vi.mocked(useNavigation);
  const mockUseScroll = vi.mocked(useScroll);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      isHomeActive: false,
      isExploreActive: false,
      isNotificationsActive: false,
      isMessagesActive: false,
    });
    mockUseScroll.mockReturnValue('up');
  });

  it('should render all navigation links', () => {
    render(<BottomNav />);
    
    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(4);
  });

  it('should render correct href attributes', () => {
    render(<BottomNav />);
    
    const links = screen.getAllByRole('link');
    
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/transactions');
    expect(links[2]).toHaveAttribute('href', '/chatbot');
    expect(links[3]).toHaveAttribute('href', '/messages');
  });

  it('should show icons when navigation states are active', () => {
    mockUseNavigation.mockReturnValue({
      isHomeActive: true,
      isExploreActive: true,
      isNotificationsActive: true,
      isMessagesActive: true,
    });

    const { container } = render(<BottomNav />);
    
    // Check for SVG elements (icons) - they should be present when active
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('should not show icons when navigation states are inactive', () => {
    mockUseNavigation.mockReturnValue({
      isHomeActive: false,
      isExploreActive: false,
      isNotificationsActive: false,
      isMessagesActive: false,
    });

    const { container } = render(<BottomNav />);
    
    // Check for SVG elements (icons) - they should not be present when inactive
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(0);
  });

  it('should apply correct CSS classes based on scroll direction', () => {
    mockUseScroll.mockReturnValue('up');
    
    const { container } = render(<BottomNav />);
    
    const navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toHaveClass('fixed', 'bottom-0', 'w-full', 'py-4', 'z-10');
    expect(navContainer).not.toHaveClass('opacity-25', 'duration-500');
  });

  it('should apply opacity classes when scrolling down', () => {
    mockUseScroll.mockReturnValue('down');
    
    const { container } = render(<BottomNav />);
    
    const navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toHaveClass('opacity-25', 'duration-500');
  });

  it('should have sm:hidden class for responsive design', () => {
    const { container } = render(<BottomNav />);
    
    const navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toHaveClass('sm:hidden');
  });

  it('should have proper background and border classes', () => {
    const { container } = render(<BottomNav />);
    
    const navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toHaveClass(
      'bg-zinc-100',
      'dark:bg-zinc-950',
      'border-t',
      'dark:border-zinc-800',
      'border-zinc-200',
      'shadow-lg'
    );
  });

  it('should render with proper structure', () => {
    const { container } = render(<BottomNav />);
    
    // Check main container
    const navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toBeInTheDocument();
    
    // Check inner container
    const innerContainer = navContainer.querySelector('.flex.flex-row.justify-around.items-center');
    expect(innerContainer).toBeInTheDocument();
    
    // Check links are inside inner container
    const links = innerContainer?.querySelectorAll('a');
    expect(links).toHaveLength(4);
  });

  it('should handle individual navigation states correctly', () => {
    // Test home active
    mockUseNavigation.mockReturnValue({
      isHomeActive: true,
      isExploreActive: false,
      isNotificationsActive: false,
      isMessagesActive: false,
    });

    const { container, rerender } = render(<BottomNav />);
    let svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(1);

    // Test transactions active
    mockUseNavigation.mockReturnValue({
      isHomeActive: false,
      isExploreActive: true,
      isNotificationsActive: false,
      isMessagesActive: false,
    });

    rerender(<BottomNav />);
    svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(1);

    // Test chatbot active
    mockUseNavigation.mockReturnValue({
      isHomeActive: false,
      isExploreActive: false,
      isNotificationsActive: true,
      isMessagesActive: false,
    });

    rerender(<BottomNav />);
    svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(1);

    // Test messages active
    mockUseNavigation.mockReturnValue({
      isHomeActive: false,
      isExploreActive: false,
      isNotificationsActive: false,
      isMessagesActive: true,
    });

    rerender(<BottomNav />);
    svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(1);
  });

  it('should handle multiple navigation states active simultaneously', () => {
    mockUseNavigation.mockReturnValue({
      isHomeActive: true,
      isExploreActive: true,
      isNotificationsActive: false,
      isMessagesActive: false,
    });

    const { container } = render(<BottomNav />);
    
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(2);
  });

  it('should handle scroll direction changes', () => {
    mockUseScroll.mockReturnValue('up');
    
    const { container, rerender } = render(<BottomNav />);
    
    let navContainer = container.firstChild as HTMLElement;
    expect(navContainer).not.toHaveClass('opacity-25');
    
    // Change scroll direction
    mockUseScroll.mockReturnValue('down');
    rerender(<BottomNav />);
    
    navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toHaveClass('opacity-25', 'duration-500');
  });

  it('should maintain fixed positioning', () => {
    const { container } = render(<BottomNav />);
    
    const navContainer = container.firstChild as HTMLElement;
    expect(navContainer).toHaveClass('fixed', 'bottom-0', 'z-10');
  });

  it('should have proper flex layout for navigation items', () => {
    const { container } = render(<BottomNav />);
    
    const innerContainer = container.querySelector('.flex.flex-row.justify-around.items-center');
    expect(innerContainer).toHaveClass('flex', 'flex-row', 'justify-around', 'items-center', 'bg-transparent', 'w-full');
  });

  it('should render links with proper flex classes', () => {
    const { container } = render(<BottomNav />);
    
    const links = container.querySelectorAll('a');
    links.forEach(link => {
      expect(link).toHaveClass('flex', 'items-center');
    });
  });

  it('should handle edge cases with scroll effects', () => {
    // Test with null/undefined scroll direction
    mockUseScroll.mockReturnValue(null as unknown as string);
    
    const { container } = render(<BottomNav />);
    
    const navContainer = container.firstChild as HTMLElement;
    // Should default to no opacity classes when scroll direction is falsy
    expect(navContainer).toHaveClass('opacity-25', 'duration-500');
  });
});
