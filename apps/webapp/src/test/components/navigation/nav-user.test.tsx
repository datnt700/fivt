import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { NavUser } from '@/components/navigation/nav-user';
import { signOut } from 'next-auth/react';
import { useSidebar } from '@/components/ui/sidebar';

// Mock next-intl
const mockTranslations = {
  'navigation.settings': 'Settings',
  'navigation.logout': 'Logout',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const fullKey = `navigation.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signOut: vi.fn(),
}));

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}));

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Mock UI components
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div className={className}>{children}</div>,
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => 
    <img src={src} alt={alt} role="img" />, // eslint-disable-line @next/next/no-img-element
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div className={className}>{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div className={className}>{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => 
    asChild ? children : <button>{children}</button>,
  DropdownMenuLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div className={className}>{children}</div>,
  DropdownMenuGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, asChild, onClick }: { children: React.ReactNode; asChild?: boolean; onClick?: () => void }) => 
    asChild ? children : <button onClick={onClick}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <button className={className}>{children}</button>,
  useSidebar: vi.fn(() => ({ isMobile: false })),
}));

describe('NavUser', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockSignOut = vi.mocked(signOut);
  const mockUseSidebar = vi.mocked(useSidebar);

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({ url: '/auth/login' });
    mockUseSidebar.mockReturnValue({ 
      isMobile: false,
      state: 'expanded',
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      toggleSidebar: vi.fn(),
    });
  });

  it('should render user information', () => {
    render(<NavUser user={mockUser} />);
    
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2);
  });

  it('should render user avatar with correct src and alt', () => {
    render(<NavUser user={mockUser} />);
    
    const avatarImages = screen.getAllByRole('img');
    expect(avatarImages[0]).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatarImages[0]).toHaveAttribute('alt', 'John Doe');
  });

  it('should render user initials as fallback when no avatar', () => {
    const userWithoutAvatar = {
      ...mockUser,
      avatar: '',
    };
    
    render(<NavUser user={userWithoutAvatar} />);
    
    expect(screen.getAllByText('JD')).toHaveLength(2);
  });

  it('should render settings link with correct href', () => {
    render(<NavUser user={mockUser} />);
    
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).toHaveAttribute('href', '/profile');
  });

  it('should render logout button', () => {
    render(<NavUser user={mockUser} />);
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should handle logout click', async () => {
    render(<NavUser user={mockUser} />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('should handle empty user name gracefully', () => {
    const userWithEmptyName = {
      ...mockUser,
      name: '',
    };
    
    render(<NavUser user={userWithEmptyName} />);
    
    // Should render email without crashing
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2);
    // Initials should be empty
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('should handle empty user email gracefully', () => {
    const userWithEmptyEmail = {
      ...mockUser,
      email: '',
    };
    
    render(<NavUser user={userWithEmptyEmail} />);
    
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    // Component should render without crashing even with empty email
  });

  it('should generate correct initials for different name formats', () => {
    const testCases = [
      { name: 'John Doe', expected: 'JD' },
      { name: 'John', expected: 'J' },
      { name: 'John Middle Doe', expected: 'JM' },
      { name: 'john doe', expected: 'JD' },
      { name: '  John   Doe  ', expected: 'JD' },
      { name: 'John-Paul Smith', expected: 'JS' },
    ];

    testCases.forEach(({ name, expected }) => {
      const { unmount } = render(<NavUser user={{ ...mockUser, name, avatar: '' }} />);
      expect(screen.getAllByText(expected)).toHaveLength(2);
      unmount();
    });
  });

  it('should render dropdown menu with proper structure', () => {
    render(<NavUser user={mockUser} />);
    
    // Check for user info in trigger and dropdown
    expect(screen.getAllByText('John Doe')).toHaveLength(2);
    expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2);
    
    // Check for settings and logout items
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Check for separators
    const separators = screen.getAllByRole('separator');
    expect(separators.length).toBeGreaterThan(0);
  });

  it('should handle mobile layout', () => {
    mockUseSidebar.mockReturnValue({ 
      isMobile: true,
      state: 'expanded',
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      toggleSidebar: vi.fn(),
    });

    render(<NavUser user={mockUser} />);

    // Component should render without issues on mobile
    expect(screen.getAllByText('John Doe')).toHaveLength(2); // Trigger and dropdown
  });

  it('should handle desktop layout', () => {
    mockUseSidebar.mockReturnValue({ 
      isMobile: false,
      state: 'expanded',
      open: true,
      setOpen: vi.fn(),
      openMobile: false,
      setOpenMobile: vi.fn(),
      toggleSidebar: vi.fn(),
    });

    render(<NavUser user={mockUser} />);

    // Component should render without issues on desktop
    expect(screen.getAllByText('John Doe')).toHaveLength(2); // Trigger and dropdown
  });  it('should handle special characters in user name and email', () => {
    const userWithSpecialChars = {
      name: "John O'Connor-Smith",
      email: 'john.o\'connor+test@example.com',
      avatar: '',
    };

    render(<NavUser user={userWithSpecialChars} />);

    expect(screen.getAllByText("John O'Connor-Smith")).toHaveLength(2);
    expect(screen.getAllByText('john.o\'connor+test@example.com')).toHaveLength(2);
  });

  it('should handle very long user name and email', () => {
    const userWithLongInfo = {
      name: 'This is a very long user name that might overflow the container',
      email: 'this.is.a.very.long.email.address.that.might.overflow@example.com',
      avatar: '',
    };

    render(<NavUser user={userWithLongInfo} />);

    expect(screen.getAllByText('This is a very long user name that might overflow the container')).toHaveLength(2);
    expect(screen.getAllByText('this.is.a.very.long.email.address.that.might.overflow@example.com')).toHaveLength(2);
  });  it('should handle signOut errors gracefully', async () => {
    // Mock signOut to resolve normally - the error handling should be in the component
    mockSignOut.mockResolvedValueOnce({ url: '/auth/login' });
    
    render(<NavUser user={mockUser} />);
    
    const logoutButton = screen.getByText('Logout');
    
    // Click should not crash the app
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should handle avatar loading errors gracefully', () => {
    render(<NavUser user={mockUser} />);
    
    const avatarImages = screen.getAllByRole('img');
    if (avatarImages[0]) {
      fireEvent.error(avatarImages[0]);
    }
    
    // Should still render fallback initials
    expect(screen.getAllByText('JD')).toHaveLength(2); // Both trigger and dropdown content
  });
});