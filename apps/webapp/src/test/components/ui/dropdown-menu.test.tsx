import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  CheckIcon: vi.fn((props) => <svg data-testid="check-icon" {...props} />),
  ChevronRightIcon: vi.fn((props) => <svg data-testid="chevron-right-icon" {...props} />),
  CircleIcon: vi.fn((props) => <svg data-testid="circle-icon" {...props} />),
}));

// Mock @radix-ui/react-dropdown-menu
vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: vi.fn(({ children, ...props }) => (
    <div data-testid="dropdown-menu-root" data-slot="dropdown-menu" {...props}>
      {children}
    </div>
  )),
  Portal: vi.fn(({ children, ...props }) => (
    <div data-testid="dropdown-menu-portal" data-slot="dropdown-menu-portal" {...props}>
      {children}
    </div>
  )),
  Trigger: vi.fn(({ children, ...props }) => (
    <button data-testid="dropdown-menu-trigger" data-slot="dropdown-menu-trigger" {...props}>
      {children}
    </button>
  )),
  Content: vi.fn(({ children, className, ...props }) => (
    <div data-testid="dropdown-menu-content" data-slot="dropdown-menu-content" className={className} {...props}>
      {children}
    </div>
  )),
  Group: vi.fn(({ children, ...props }) => (
    <div data-testid="dropdown-menu-group" data-slot="dropdown-menu-group" {...props}>
      {children}
    </div>
  )),
  Item: vi.fn(({ children, className, ...props }) => (
    <div data-testid="dropdown-menu-item" data-slot="dropdown-menu-item" className={className} {...props}>
      {children}
    </div>
  )),
  CheckboxItem: vi.fn(({ children, className, checked, ...props }) => (
    <div data-testid="dropdown-menu-checkbox-item" data-slot="dropdown-menu-checkbox-item" className={className} data-checked={checked} {...props}>
      {children}
    </div>
  )),
  RadioGroup: vi.fn(({ children, ...props }) => (
    <div data-testid="dropdown-menu-radio-group" data-slot="dropdown-menu-radio-group" {...props}>
      {children}
    </div>
  )),
  RadioItem: vi.fn(({ children, className, ...props }) => (
    <div data-testid="dropdown-menu-radio-item" data-slot="dropdown-menu-radio-item" className={className} {...props}>
      {children}
    </div>
  )),
  Label: vi.fn(({ children, className, ...props }) => (
    <div data-testid="dropdown-menu-label" data-slot="dropdown-menu-label" className={className} {...props}>
      {children}
    </div>
  )),
  Separator: vi.fn((props) => (
    <div data-testid="dropdown-menu-separator" data-slot="dropdown-menu-separator" {...props} />
  )),
  Sub: vi.fn(({ children, ...props }) => (
    <div data-testid="dropdown-menu-sub" data-slot="dropdown-menu-sub" {...props}>
      {children}
    </div>
  )),
  SubTrigger: vi.fn(({ children, className, ...props }) => (
    <div data-testid="dropdown-menu-sub-trigger" data-slot="dropdown-menu-sub-trigger" className={className} {...props}>
      {children}
    </div>
  )),
  SubContent: vi.fn(({ children, className, ...props }) => (
    <div data-testid="dropdown-menu-sub-content" data-slot="dropdown-menu-sub-content" className={className} {...props}>
      {children}
    </div>
  )),
  ItemIndicator: vi.fn(({ children, ...props }) => (
    <span data-testid="dropdown-menu-item-indicator" {...props}>
      {children}
    </span>
  )),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('DropdownMenu', () => {
  it('renders with default props', () => {
    render(<DropdownMenu />);
    
    const menu = screen.getByTestId('dropdown-menu-root');
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('data-slot', 'dropdown-menu');
  });

  it('passes through additional props', () => {
    render(<DropdownMenu open={true} />);
    
    const menu = screen.getByTestId('dropdown-menu-root');
    expect(menu).toHaveAttribute('open');
  });
});

describe('DropdownMenuPortal', () => {
  it('renders with default props', () => {
    render(<DropdownMenuPortal />);
    
    const portal = screen.getByTestId('dropdown-menu-portal');
    expect(portal).toBeInTheDocument();
    expect(portal).toHaveAttribute('data-slot', 'dropdown-menu-portal');
  });

  it('renders children', () => {
    render(
      <DropdownMenuPortal>
        <div>Portal content</div>
      </DropdownMenuPortal>
    );
    
    expect(screen.getByText('Portal content')).toBeInTheDocument();
  });
});

describe('DropdownMenuTrigger', () => {
  it('renders with default props', () => {
    render(<DropdownMenuTrigger>Open menu</DropdownMenuTrigger>);
    
    const trigger = screen.getByTestId('dropdown-menu-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-trigger');
    expect(trigger).toHaveTextContent('Open menu');
  });

  it('passes through additional props', () => {
    render(<DropdownMenuTrigger disabled>Open menu</DropdownMenuTrigger>);
    
    const trigger = screen.getByTestId('dropdown-menu-trigger');
    expect(trigger).toHaveAttribute('disabled');
  });
});

describe('DropdownMenuContent', () => {
  it('renders with default props', () => {
    render(<DropdownMenuContent />);
    
    const content = screen.getByTestId('dropdown-menu-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'dropdown-menu-content');
    expect(content).toHaveAttribute('sideOffset', '4');
  });

  it('renders with custom className', () => {
    render(<DropdownMenuContent className="custom-content" />);
    
    const content = screen.getByTestId('dropdown-menu-content');
    expect(content).toHaveClass('bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md custom-content');
  });

  it('renders with custom sideOffset', () => {
    render(<DropdownMenuContent sideOffset={8} />);
    
    const content = screen.getByTestId('dropdown-menu-content');
    expect(content).toHaveAttribute('sideOffset', '8');
  });
});

describe('DropdownMenuGroup', () => {
  it('renders with default props', () => {
    render(<DropdownMenuGroup />);
    
    const group = screen.getByTestId('dropdown-menu-group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('data-slot', 'dropdown-menu-group');
  });

  it('renders children', () => {
    render(
      <DropdownMenuGroup>
        <div>Group content</div>
      </DropdownMenuGroup>
    );
    
    expect(screen.getByText('Group content')).toBeInTheDocument();
  });
});

describe('DropdownMenuItem', () => {
  it('renders with default props', () => {
    render(<DropdownMenuItem>Menu item</DropdownMenuItem>);
    
    const item = screen.getByTestId('dropdown-menu-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item');
    expect(item).toHaveAttribute('data-variant', 'default');
    expect(item).toHaveTextContent('Menu item');
  });

  it('renders with inset prop', () => {
    render(<DropdownMenuItem inset>Menu item</DropdownMenuItem>);
    
    const item = screen.getByTestId('dropdown-menu-item');
    expect(item).toHaveAttribute('data-inset', 'true');
  });

  it('renders with destructive variant', () => {
    render(<DropdownMenuItem variant="destructive">Delete item</DropdownMenuItem>);
    
    const item = screen.getByTestId('dropdown-menu-item');
    expect(item).toHaveAttribute('data-variant', 'destructive');
  });

  it('renders with custom className', () => {
    render(<DropdownMenuItem className="custom-item">Menu item</DropdownMenuItem>);
    
    const item = screen.getByTestId('dropdown-menu-item');
    expect(item.className).toContain('custom-item');
  });
});

describe('DropdownMenuCheckboxItem', () => {
  it('renders with default props', () => {
    render(<DropdownMenuCheckboxItem>Checkbox item</DropdownMenuCheckboxItem>);
    
    const item = screen.getByTestId('dropdown-menu-checkbox-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-slot', 'dropdown-menu-checkbox-item');
    expect(item).toHaveTextContent('Checkbox item');
  });

  it('renders with checked state', () => {
    render(<DropdownMenuCheckboxItem checked={true}>Checked item</DropdownMenuCheckboxItem>);
    
    const item = screen.getByTestId('dropdown-menu-checkbox-item');
    expect(item).toHaveAttribute('data-checked', 'true');
  });

  it('renders with CheckIcon when checked', () => {
    render(<DropdownMenuCheckboxItem checked={true}>Checked item</DropdownMenuCheckboxItem>);
    
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<DropdownMenuCheckboxItem className="custom-checkbox">Checkbox item</DropdownMenuCheckboxItem>);
    
    const item = screen.getByTestId('dropdown-menu-checkbox-item');
    expect(item.className).toContain('custom-checkbox');
  });
});

describe('DropdownMenuRadioGroup', () => {
  it('renders with default props', () => {
    render(<DropdownMenuRadioGroup />);
    
    const group = screen.getByTestId('dropdown-menu-radio-group');
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('data-slot', 'dropdown-menu-radio-group');
  });

  it('renders children', () => {
    render(
      <DropdownMenuRadioGroup>
        <div>Radio group content</div>
      </DropdownMenuRadioGroup>
    );
    
    expect(screen.getByText('Radio group content')).toBeInTheDocument();
  });
});

describe('DropdownMenuRadioItem', () => {
  it('renders with default props', () => {
    render(<DropdownMenuRadioItem>Radio item</DropdownMenuRadioItem>);
    
    const item = screen.getByTestId('dropdown-menu-radio-item');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('data-slot', 'dropdown-menu-radio-item');
    expect(item).toHaveTextContent('Radio item');
  });

  it('renders with CircleIcon', () => {
    render(<DropdownMenuRadioItem>Radio item</DropdownMenuRadioItem>);
    
    expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<DropdownMenuRadioItem className="custom-radio">Radio item</DropdownMenuRadioItem>);
    
    const item = screen.getByTestId('dropdown-menu-radio-item');
    expect(item.className).toContain('custom-radio');
  });
});

describe('DropdownMenuLabel', () => {
  it('renders with default props', () => {
    render(<DropdownMenuLabel>Label text</DropdownMenuLabel>);
    
    const label = screen.getByTestId('dropdown-menu-label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('data-slot', 'dropdown-menu-label');
    expect(label).toHaveTextContent('Label text');
  });

  it('renders with inset prop', () => {
    render(<DropdownMenuLabel inset>Label text</DropdownMenuLabel>);
    
    const label = screen.getByTestId('dropdown-menu-label');
    expect(label).toHaveAttribute('data-inset', 'true');
  });

  it('renders with custom className', () => {
    render(<DropdownMenuLabel className="custom-label">Label text</DropdownMenuLabel>);
    
    const label = screen.getByTestId('dropdown-menu-label');
    expect(label).toHaveClass('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8 custom-label');
  });
});

describe('DropdownMenuSeparator', () => {
  it('renders with default props', () => {
    render(<DropdownMenuSeparator />);
    
    const separator = screen.getByTestId('dropdown-menu-separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('data-slot', 'dropdown-menu-separator');
  });

  it('renders with custom className', () => {
    render(<DropdownMenuSeparator className="custom-separator" />);
    
    const separator = screen.getByTestId('dropdown-menu-separator');
    expect(separator).toHaveClass('bg-border -mx-1 my-1 h-px custom-separator');
  });
});

describe('DropdownMenuShortcut', () => {
  it('renders with default props', () => {
    render(<DropdownMenuShortcut>⌘K</DropdownMenuShortcut>);
    
    const shortcut = screen.getByText('⌘K');
    expect(shortcut).toBeInTheDocument();
    expect(shortcut).toHaveAttribute('data-slot', 'dropdown-menu-shortcut');
  });

  it('renders with custom className', () => {
    render(<DropdownMenuShortcut className="custom-shortcut">⌘K</DropdownMenuShortcut>);
    
    const shortcut = screen.getByText('⌘K');
    expect(shortcut).toHaveClass('text-muted-foreground ml-auto text-xs tracking-widest custom-shortcut');
  });
});

describe('DropdownMenuSub', () => {
  it('renders with default props', () => {
    render(<DropdownMenuSub />);
    
    const sub = screen.getByTestId('dropdown-menu-sub');
    expect(sub).toBeInTheDocument();
    expect(sub).toHaveAttribute('data-slot', 'dropdown-menu-sub');
  });

  it('renders children', () => {
    render(
      <DropdownMenuSub>
        <div>Sub menu content</div>
      </DropdownMenuSub>
    );
    
    expect(screen.getByText('Sub menu content')).toBeInTheDocument();
  });
});

describe('DropdownMenuSubTrigger', () => {
  it('renders with default props', () => {
    render(<DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>);
    
    const trigger = screen.getByTestId('dropdown-menu-sub-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-slot', 'dropdown-menu-sub-trigger');
    expect(trigger).toHaveTextContent('Sub trigger');
  });

  it('renders with inset prop', () => {
    render(<DropdownMenuSubTrigger inset>Sub trigger</DropdownMenuSubTrigger>);
    
    const trigger = screen.getByTestId('dropdown-menu-sub-trigger');
    expect(trigger).toHaveAttribute('data-inset', 'true');
  });

  it('renders with ChevronRightIcon', () => {
    render(<DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>);
    
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<DropdownMenuSubTrigger className="custom-sub-trigger">Sub trigger</DropdownMenuSubTrigger>);
    
    const trigger = screen.getByTestId('dropdown-menu-sub-trigger');
    expect(trigger.className).toContain('custom-sub-trigger');
  });
});

describe('DropdownMenuSubContent', () => {
  it('renders with default props', () => {
    render(<DropdownMenuSubContent />);
    
    const content = screen.getByTestId('dropdown-menu-sub-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute('data-slot', 'dropdown-menu-sub-content');
  });

  it('renders with custom className', () => {
    render(<DropdownMenuSubContent className="custom-sub-content" />);
    
    const content = screen.getByTestId('dropdown-menu-sub-content');
    expect(content.className).toContain('custom-sub-content');
  });

  it('renders children', () => {
    render(
      <DropdownMenuSubContent>
        <div>Sub content</div>
      </DropdownMenuSubContent>
    );
    
    expect(screen.getByText('Sub content')).toBeInTheDocument();
  });
});

describe('DropdownMenu Integration', () => {
  it('renders complete dropdown menu', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Checkbox</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem>Radio 1</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByTestId('dropdown-menu-root')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-content')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-menu-separator')).toBeInTheDocument();
    expect(screen.getByText('Checkbox')).toBeInTheDocument();
    expect(screen.getByText('Radio 1')).toBeInTheDocument();
  });
});