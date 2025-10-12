import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckIcon: vi.fn((props) => <svg data-testid="check-icon" {...props} />),
  ChevronDownIcon: vi.fn((props) => <svg data-testid="chevron-down-icon" {...props} />),
  ChevronUpIcon: vi.fn((props) => <svg data-testid="chevron-up-icon" {...props} />),
}));

// Mock @radix-ui/react-select
vi.mock('@radix-ui/react-select', () => ({
  Root: vi.fn(({ children, ...props }) => (
    <div data-testid="select-root" data-slot="select" {...props}>
      {children}
    </div>
  )),
  Group: vi.fn(({ children, ...props }) => (
    <div data-testid="select-group" data-slot="select-group" {...props}>
      {children}
    </div>
  )),
  Value: vi.fn(({ children, ...props }) => (
    <span data-testid="select-value" data-slot="select-value" {...props}>
      {children}
    </span>
  )),
  Trigger: vi.fn(({ children, className, ...props }) => (
    <button data-testid="select-trigger" data-slot="select-trigger" className={className} {...props}>
      {children}
    </button>
  )),
  Icon: vi.fn(({ children, asChild, ...props }) => (
    <span data-testid="select-icon" data-as-child={asChild} {...props}>
      {children}
    </span>
  )),
  Portal: vi.fn(({ children, ...props }) => (
    <div data-testid="select-portal" {...props}>
      {children}
    </div>
  )),
  Content: vi.fn(({ children, className, position, ...props }) => (
    <div data-testid="select-content" data-slot="select-content" className={className} data-position={position} {...props}>
      {children}
    </div>
  )),
  Viewport: vi.fn(({ children, className, ...props }) => (
    <div data-testid="select-viewport" className={className} {...props}>
      {children}
    </div>
  )),
  Label: vi.fn(({ children, className, ...props }) => (
    <div data-testid="select-label" data-slot="select-label" className={className} {...props}>
      {children}
    </div>
  )),
  Item: vi.fn(({ children, className, ...props }) => (
    <div data-testid="select-item" data-slot="select-item" className={className} {...props}>
      {children}
    </div>
  )),
  ItemText: vi.fn(({ children, ...props }) => (
    <span data-testid="select-item-text" {...props}>
      {children}
    </span>
  )),
  ItemIndicator: vi.fn(({ children, ...props }) => (
    <span data-testid="select-item-indicator" {...props}>
      {children}
    </span>
  )),
  Separator: vi.fn(({ className, ...props }) => (
    <div data-testid="select-separator" data-slot="select-separator" className={className} {...props} />
  )),
  ScrollUpButton: vi.fn(({ className, children, ...props }) => (
    <div data-testid="select-scroll-up-button" data-slot="select-scroll-up-button" className={className} {...props}>
      {children}
    </div>
  )),
  ScrollDownButton: vi.fn(({ className, children, ...props }) => (
    <div data-testid="select-scroll-down-button" data-slot="select-scroll-down-button" className={className} {...props}>
      {children}
    </div>
  )),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('Select', () => {
  it('renders with default props', () => {
    render(<Select />);
    
    const select = screen.getByTestId('select-root');
    expect(select).toBeInTheDocument();
    expect(select).toHaveAttribute('data-slot', 'select');
  });

  it('passes through additional props', () => {
    render(<Select open={true} />);
    
    const select = screen.getByTestId('select-root');
    expect(select).toHaveAttribute('open');
  });

  it('renders children', () => {
    render(
      <Select>
        <div>Select content</div>
      </Select>
    );
    
    expect(screen.getByText('Select content')).toBeInTheDocument();
  });
});

describe('SelectGroup', () => {
  it('renders with default props', () => {
    render(<SelectGroup />);
    
    const group = screen.getByTestId('select-group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('data-slot', 'select-group');
  });

  it('renders children', () => {
    render(
      <SelectGroup>
        <div>Group content</div>
      </SelectGroup>
    );
    
    expect(screen.getByText('Group content')).toBeInTheDocument();
  });
});

describe('SelectValue', () => {
  it('renders with default props', () => {
    render(<SelectValue />);
    
    const value = screen.getByTestId('select-value');
    expect(value).toBeInTheDocument();
    expect(value).toHaveAttribute('data-slot', 'select-value');
  });

  it('renders with placeholder', () => {
    render(<SelectValue placeholder="Select an option" />);
    
    const value = screen.getByTestId('select-value');
    expect(value).toHaveAttribute('placeholder', 'Select an option');
  });
});

describe('SelectTrigger', () => {
  it('renders with default props', () => {
    render(<SelectTrigger />);
    
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    expect(trigger).toHaveAttribute('data-size', 'default');
  });

  it('renders with small size', () => {
    render(<SelectTrigger size="sm" />);
    
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveAttribute('data-size', 'sm');
  });

  it('renders with custom className', () => {
    render(<SelectTrigger className="custom-trigger" />);
    
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger.className).toContain('custom-trigger');
  });

  it('renders children and chevron icon', () => {
    render(
      <SelectTrigger>
        <span>Trigger content</span>
      </SelectTrigger>
    );
    
    expect(screen.getByText('Trigger content')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
  });

  it('passes through additional props', () => {
    render(<SelectTrigger disabled />);
    
    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toHaveAttribute('disabled');
  });
});

describe('SelectContent', () => {
  it('renders with default props', () => {
    render(<SelectContent />);
    
    const content = screen.getByTestId('select-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'select-content');
    expect(content).toHaveAttribute('data-position', 'popper');
  });

  it('renders with custom position', () => {
    render(<SelectContent position="item-aligned" />);
    
    const content = screen.getByTestId('select-content');
    expect(content).toHaveAttribute('data-position', 'item-aligned');
  });

  it('renders with custom className', () => {
    render(<SelectContent className="custom-content" />);
    
    const content = screen.getByTestId('select-content');
    expect(content.className).toContain('custom-content');
  });

  it('renders children with scroll buttons', () => {
    render(
      <SelectContent>
        <div>Content items</div>
      </SelectContent>
    );
    
    expect(screen.getByText('Content items')).toBeInTheDocument();
    expect(screen.getByTestId('select-scroll-up-button')).toBeInTheDocument();
    expect(screen.getByTestId('select-scroll-down-button')).toBeInTheDocument();
  });
});

describe('SelectLabel', () => {
  it('renders with default props', () => {
    render(<SelectLabel>Label text</SelectLabel>);
    
    const label = screen.getByTestId('select-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-slot', 'select-label');
    expect(label).toHaveTextContent('Label text');
  });

  it('renders with custom className', () => {
    render(<SelectLabel className="custom-label">Label text</SelectLabel>);
    
    const label = screen.getByTestId('select-label');
    expect(label).toHaveClass('text-muted-foreground px-2 py-1.5 text-xs custom-label');
  });
});

describe('SelectItem', () => {
  it('renders with default props', () => {
    render(<SelectItem value="item">Item text</SelectItem>);
    
    const item = screen.getByTestId('select-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-slot', 'select-item');
  });

  it('renders with custom className', () => {
    render(<SelectItem value="item" className="custom-item">Item text</SelectItem>);
    
    const item = screen.getByTestId('select-item');
    expect(item.className).toContain('custom-item');
  });

  it('renders with check icon and item text', () => {
    render(<SelectItem value="item">Item text</SelectItem>);
    
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-text')).toBeInTheDocument();
    expect(screen.getByText('Item text')).toBeInTheDocument();
  });

  it('passes through value and other props', () => {
    render(<SelectItem value="option1">Item text</SelectItem>);
    
    const item = screen.getByTestId('select-item');
    expect(item).toHaveAttribute('value', 'option1');
  });
});

describe('SelectSeparator', () => {
  it('renders with default props', () => {
    render(<SelectSeparator />);
    
    const separator = screen.getByTestId('select-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-slot', 'select-separator');
  });

  it('renders with custom className', () => {
    render(<SelectSeparator className="custom-separator" />);
    
    const separator = screen.getByTestId('select-separator');
    expect(separator).toHaveClass('bg-border pointer-events-none -mx-1 my-1 h-px custom-separator');
  });
});

describe('SelectScrollUpButton', () => {
  it('renders with default props', () => {
    render(<SelectScrollUpButton />);
    
    const button = screen.getByTestId('select-scroll-up-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'select-scroll-up-button');
  });

  it('renders with chevron up icon', () => {
    render(<SelectScrollUpButton />);
    
    expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<SelectScrollUpButton className="custom-scroll-up" />);
    
    const button = screen.getByTestId('select-scroll-up-button');
    expect(button).toHaveClass('flex cursor-default items-center justify-center py-1 custom-scroll-up');
  });
});

describe('SelectScrollDownButton', () => {
  it('renders with default props', () => {
    render(<SelectScrollDownButton />);
    
    const button = screen.getByTestId('select-scroll-down-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-slot', 'select-scroll-down-button');
  });

  it('renders with chevron down icon', () => {
    render(<SelectScrollDownButton />);
    
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<SelectScrollDownButton className="custom-scroll-down" />);
    
    const button = screen.getByTestId('select-scroll-down-button');
    expect(button).toHaveClass('flex cursor-default items-center justify-center py-1 custom-scroll-down');
  });
});

describe('Select Integration', () => {
  it('renders complete select component', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectLabel>Options</SelectLabel>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>More options</SelectLabel>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );

    expect(screen.getByTestId('select-root')).toBeInTheDocument();
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('select-value')).toBeInTheDocument();
    expect(screen.getByTestId('select-content')).toBeInTheDocument();
    expect(screen.getAllByTestId('select-label')).toHaveLength(2);
    expect(screen.getAllByTestId('select-item')).toHaveLength(3);
    expect(screen.getByTestId('select-separator')).toBeInTheDocument();
    expect(screen.getByTestId('select-group')).toBeInTheDocument();
  });
});