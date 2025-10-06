import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { NavItems } from '@/components/navigation/nav-items';
import { Home, Settings, Users } from 'lucide-react';

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock Sidebar components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children, className }: { children: React.ReactNode; className?: string }) => 
    <div className={className}>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => 
    asChild ? children : <button>{children}</button>,
}));

describe('NavItems', () => {
  const mockItems = [
    {
      name: 'Home',
      url: '/',
      icon: Home,
    },
    {
      name: 'Settings',
      url: '/settings',
      icon: Settings,
    },
    {
      name: 'Users',
      url: '/users',
      icon: Users,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all navigation items', () => {
    render(<NavItems items={mockItems} />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('should render correct links for each item', () => {
    render(<NavItems items={mockItems} />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    const usersLink = screen.getByRole('link', { name: /users/i });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(settingsLink).toHaveAttribute('href', '/settings');
    expect(usersLink).toHaveAttribute('href', '/users');
  });

  it('should render icons for each item', () => {
    const { container } = render(<NavItems items={mockItems} />);
    
    // Check that SVG elements (icons) are present
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements).toHaveLength(3);
    
    // Verify specific icon classes are present
    expect(container.querySelector('.lucide-house')).toBeInTheDocument();
    expect(container.querySelector('.lucide-settings')).toBeInTheDocument();
    expect(container.querySelector('.lucide-users')).toBeInTheDocument();
  });

  it('should handle empty items array', () => {
    render(<NavItems items={[]} />);
    
    // Should render the container but no items
    const listContainer = screen.getByRole('list');
    expect(listContainer).toBeInTheDocument();
    expect(listContainer).toBeEmptyDOMElement();
  });

  it('should render items with proper sidebar structure', () => {
    const { container } = render(<NavItems items={mockItems} />);
    
    // Check for sidebar group container
    const sidebarGroup = container.querySelector('.group-data-\\[collapsible\\=icon\\]\\:hidden');
    expect(sidebarGroup).toBeInTheDocument();
    
    // Check for list structure
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    // Check for list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('should handle special characters in item names', () => {
    const specialItems = [
      {
        name: 'User & Settings',
        url: '/user-settings',
        icon: Settings,
      },
      {
        name: 'Home/Dashboard',
        url: '/dashboard',
        icon: Home,
      },
    ];

    render(<NavItems items={specialItems} />);
    
    expect(screen.getByText('User & Settings')).toBeInTheDocument();
    expect(screen.getByText('Home/Dashboard')).toBeInTheDocument();
  });

  it('should handle long item names', () => {
    const longNameItems = [
      {
        name: 'This is a very long navigation item name that might overflow',
        url: '/long-name',
        icon: Home,
      },
    ];

    render(<NavItems items={longNameItems} />);
    
    expect(screen.getByText('This is a very long navigation item name that might overflow'))
      .toBeInTheDocument();
  });

  it('should handle single item', () => {
    const singleItem = [
      {
        name: 'Dashboard',
        url: '/dashboard',
        icon: Home,
      },
    ];

    render(<NavItems items={singleItem} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('should handle items with same names but different URLs', () => {
    const duplicateNameItems = [
      {
        name: 'Settings',
        url: '/user-settings',
        icon: Settings,
      },
      {
        name: 'Settings',
        url: '/admin-settings',
        icon: Settings,
      },
    ];

    render(<NavItems items={duplicateNameItems} />);
    
    const settingsElements = screen.getAllByText('Settings');
    expect(settingsElements).toHaveLength(2);
    
    const settingsLinks = screen.getAllByRole('link', { name: /settings/i });
    expect(settingsLinks[0]).toHaveAttribute('href', '/user-settings');
    expect(settingsLinks[1]).toHaveAttribute('href', '/admin-settings');
  });

  it('should handle items with root and nested paths', () => {
    const pathItems = [
      {
        name: 'Root',
        url: '/',
        icon: Home,
      },
      {
        name: 'Nested Page',
        url: '/section/subsection/page',
        icon: Settings,
      },
      {
        name: 'Query Params',
        url: '/search?q=test&type=user',
        icon: Users,
      },
    ];

    render(<NavItems items={pathItems} />);
    
    const rootLink = screen.getByRole('link', { name: /root/i });
    const nestedLink = screen.getByRole('link', { name: /nested page/i });
    const queryLink = screen.getByRole('link', { name: /query params/i });
    
    expect(rootLink).toHaveAttribute('href', '/');
    expect(nestedLink).toHaveAttribute('href', '/section/subsection/page');
    expect(queryLink).toHaveAttribute('href', '/search?q=test&type=user');
  });
});