import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Mock @radix-ui/react-avatar
vi.mock('@radix-ui/react-avatar', () => ({
  Root: vi.fn(({ children, className, 'data-slot': dataSlot, ...props }) => (
    <div 
      className={className} 
      data-slot={dataSlot} 
      data-testid={dataSlot}
      {...props}
    >
      {children}
    </div>
  )),
  Image: vi.fn(({ className, 'data-slot': dataSlot, ...props }) => (
    <img 
      className={className} 
      data-slot={dataSlot} 
      data-testid={dataSlot}
      {...props} 
    />
  )),
  Fallback: vi.fn(({ children, className, 'data-slot': dataSlot, ...props }) => (
    <div 
      className={className} 
      data-slot={dataSlot} 
      data-testid={dataSlot}
      {...props}
    >
      {children}
    </div>
  )),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Avatar Component', () => {
  it('renders with default props', () => {
    render(<Avatar />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-slot', 'avatar');
    expect(avatar).toHaveClass('relative flex size-8 shrink-0 overflow-hidden rounded-full');
  });

  it('renders with custom className', () => {
    render(<Avatar className="custom-avatar" />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('relative flex size-8 shrink-0 overflow-hidden rounded-full custom-avatar');
  });

  it('passes through additional props', () => {
    render(<Avatar data-testid="avatar-root" />);

    const avatar = screen.getByTestId('avatar-root');
    expect(avatar).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Avatar>
        <div>Avatar content</div>
      </Avatar>
    );

    expect(screen.getByText('Avatar content')).toBeInTheDocument();
  });
});

describe('AvatarImage Component', () => {
  it('renders with default props', () => {
    render(<AvatarImage alt="User avatar" />);

    const image = screen.getByTestId('avatar-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('data-slot', 'avatar-image');
    expect(image).toHaveClass('aspect-square size-full');
    expect(image).toHaveAttribute('alt', 'User avatar');
  });

  it('renders with custom className', () => {
    render(<AvatarImage className="custom-image" alt="User avatar" />);

    const image = screen.getByTestId('avatar-image');
    expect(image).toHaveClass('aspect-square size-full custom-image');
  });

  it('passes through src and other image props', () => {
    render(<AvatarImage src="/avatar.jpg" alt="User avatar" />);

    const image = screen.getByTestId('avatar-image');
    expect(image).toHaveAttribute('src', '/avatar.jpg');
    expect(image).toHaveAttribute('alt', 'User avatar');
  });

  it('passes through additional props', () => {
    render(<AvatarImage data-testid="custom-image" alt="User avatar" />);

    const image = screen.getByTestId('custom-image');
    expect(image).toBeInTheDocument();
  });
});

describe('AvatarFallback Component', () => {
  it('renders with default props', () => {
    render(<AvatarFallback>AB</AvatarFallback>);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
    expect(fallback).toHaveClass('bg-muted flex size-full items-center justify-center rounded-full');
    expect(fallback).toHaveTextContent('AB');
  });

  it('renders with custom className', () => {
    render(<AvatarFallback className="custom-fallback">AB</AvatarFallback>);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveClass('bg-muted flex size-full items-center justify-center rounded-full custom-fallback');
  });

  it('renders children correctly', () => {
    render(
      <AvatarFallback>
        <span>Fallback Content</span>
      </AvatarFallback>
    );

    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(<AvatarFallback data-testid="custom-fallback">AB</AvatarFallback>);

    const fallback = screen.getByTestId('custom-fallback');
    expect(fallback).toBeInTheDocument();
  });
});

describe('Avatar Integration', () => {
  it('renders complete avatar with image and fallback', () => {
    render(
      <Avatar>
        <AvatarImage src="/avatar.jpg" alt="User avatar" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId('avatar');
    const image = screen.getByTestId('avatar-image');
    const fallback = screen.getByTestId('avatar-fallback');

    expect(avatar).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(fallback).toBeInTheDocument();
    expect(avatar).toContainElement(image);
    expect(avatar).toContainElement(fallback);
  });

  it('handles complex avatar composition', () => {
    render(
      <Avatar className="large-avatar">
        <AvatarImage src="/avatar.jpg" alt="User avatar" className="rounded-lg" />
        <AvatarFallback className="text-lg">JD</AvatarFallback>
      </Avatar>
    );

    const avatar = screen.getByTestId('avatar');
    const image = screen.getByTestId('avatar-image');
    const fallback = screen.getByTestId('avatar-fallback');

    expect(avatar).toHaveClass('relative flex size-8 shrink-0 overflow-hidden rounded-full large-avatar');
    expect(image).toHaveClass('aspect-square size-full rounded-lg');
    expect(fallback).toHaveClass('bg-muted flex size-full items-center justify-center rounded-full text-lg');
  });
});