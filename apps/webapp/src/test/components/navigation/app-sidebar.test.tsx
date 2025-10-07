import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { AdminSidebar } from '@/components/navigation/app-sidebar';

// Mock next-intl
const mockTranslations = {
  'transactions.title': 'Transactions',
  'navigation.dashboard': 'Dashboard',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
}));

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

// Mock navigation components
vi.mock('@/components/navigation/nav-items', () => ({
  NavItems: ({ items }: { items: Array<{ name: string; url: string; icon: unknown }> }) => (
    <div data-testid="nav-items">
      {items.map((item) => (
        <div key={item.name} data-testid="nav-item">
          <span>{item.name}</span>
          <span>{item.url}</span>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/navigation/nav-user', () => ({
  NavUser: ({ user }: { user: { name: string; email: string; avatar: string } }) => (
    <div data-testid="nav-user">
      <span>{user.name}</span>
      <span>{user.email}</span>
      <span>{user.avatar}</span>
    </div>
  ),
}));

// Mock UI Sidebar components
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children, variant, ...props }: { children: React.ReactNode; variant?: string; [key: string]: unknown }) => 
    <div data-testid="sidebar" data-variant={variant} {...props}>{children}</div>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="sidebar-content">{children}</div>,
  SidebarFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="sidebar-footer">{children}</div>,
  SidebarHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="sidebar-header">{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuButton: ({ children, asChild, size }: { children: React.ReactNode; asChild?: boolean; size?: string }) => 
    asChild ? children : <button data-size={size}>{children}</button>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
}));

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sidebar with correct variant', () => {
    render(<AdminSidebar />);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-variant', 'inset');
  });

  it('should render FIVT brand in header', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByText('FIVT')).toBeInTheDocument();
  });

  it('should render header link to home page', () => {
    render(<AdminSidebar />);
    
    const homeLink = screen.getByRole('link', { name: /fivt/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render navigation items with correct data', () => {
    render(<AdminSidebar />);
    
    const navItems = screen.getByTestId('nav-items');
    expect(navItems).toBeInTheDocument();
    
    // Check that Dashboard item is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('/dashboard')).toBeInTheDocument();
    
    // Check that Transactions item is rendered
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('/transactions')).toBeInTheDocument();
    
    // Check that Chatbot item is rendered
    expect(screen.getByText('Chatbot')).toBeInTheDocument();
    expect(screen.getByText('/chatbot')).toBeInTheDocument();
  });

  it('should render nav user with provided props', () => {
    const userProps = {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    render(<AdminSidebar {...userProps} />);
    
    const navUser = screen.getByTestId('nav-user');
    expect(navUser).toBeInTheDocument();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/avatar.jpg')).toBeInTheDocument();
  });

  it('should render nav user with empty values when no props provided', () => {
    render(<AdminSidebar />);
    
    const navUser = screen.getByTestId('nav-user');
    expect(navUser).toBeInTheDocument();
    
    // Should have empty strings for all user properties
    const textElements = screen.getAllByText('');
    expect(textElements.length).toBeGreaterThanOrEqual(3);
  });

  it('should render all main sections', () => {
    render(<AdminSidebar />);
    
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
  });

  it('should pass through additional sidebar props', () => {
    const additionalProps = {
      className: 'custom-sidebar',
      'data-custom': 'value',
    };

    render(<AdminSidebar {...additionalProps} />);
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveClass('custom-sidebar');
    expect(sidebar).toHaveAttribute('data-custom', 'value');
  });

  it('should handle partial user data', () => {
    render(<AdminSidebar name="John Doe" />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Email and image should be empty strings
    const emptyTexts = screen.getAllByText('');
    expect(emptyTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('should use translated transaction title', () => {
    render(<AdminSidebar />);
    
    // Should use the translated version "Transactions" instead of the key
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('should render command icon in header', () => {
    render(<AdminSidebar />);
    
    // The Command icon should be rendered (we can't easily test for the icon itself in this mock setup,
    // but we can verify the structure is correct)
    const headerContent = screen.getByTestId('sidebar-header');
    expect(headerContent).toBeInTheDocument();
  });

  it('should render sidebar menu structure', () => {
    render(<AdminSidebar />);
    
    // Check for list structure in header
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThanOrEqual(1);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle empty string values gracefully', () => {
    const emptyUserProps = {
      name: '',
      email: '',
      image: '',
    };

    render(<AdminSidebar {...emptyUserProps} />);
    
    // Should render without errors
    expect(screen.getByTestId('nav-user')).toBeInTheDocument();
    expect(screen.getByTestId('nav-items')).toBeInTheDocument();
  });

  it('should handle very long user data', () => {
    const longUserProps = {
      name: 'This is a very long user name that might cause layout issues',
      email: 'this.is.a.very.long.email.address.that.might.overflow@example.com',
      image: 'https://example.com/very/long/path/to/avatar/image/that/might/cause/issues.jpg',
    };

    render(<AdminSidebar {...longUserProps} />);
    
    expect(screen.getByText(longUserProps.name)).toBeInTheDocument();
    expect(screen.getByText(longUserProps.email)).toBeInTheDocument();
    expect(screen.getByText(longUserProps.image)).toBeInTheDocument();
  });

  it('should maintain navigation item order', () => {
    render(<AdminSidebar />);
    
    const navItems = screen.getAllByTestId('nav-item');
    expect(navItems).toHaveLength(3);
    
    // First item should be Dashboard
    expect(navItems[0]).toHaveTextContent('Dashboard');
    expect(navItems[0]).toHaveTextContent('/dashboard');
    
    // Second item should be Transactions
    expect(navItems[1]).toHaveTextContent('Transactions');
    expect(navItems[1]).toHaveTextContent('/transactions');
    
    // Third item should be Chatbot
    expect(navItems[2]).toHaveTextContent('Chatbot');
    expect(navItems[2]).toHaveTextContent('/chatbot');
  });
});