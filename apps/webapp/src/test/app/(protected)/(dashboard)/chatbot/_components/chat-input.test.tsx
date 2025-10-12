import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { ChatInput } from '@/app/(protected)/(dashboard)/chatbot/_components/chat-input';

// Mock next-intl
const mockTranslations = {
  'placeholder': 'Ask me about your financial goals, budgeting, investing, or any money-related questions...',
  'send': 'Send',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    return mockTranslations[key as keyof typeof mockTranslations] || key;
  }),
}));

// Mock UI button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel, ...props }: { 
    children?: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    'aria-label'?: string; 
    [key: string]: unknown;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid="submit-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: () => <span data-testid="send-icon">Send</span>,
}));

describe('ChatInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input field with default placeholder', () => {
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Ask me about your financial goals, budgeting, investing, or any money-related questions...');
  });

  it('should render input field with custom placeholder', () => {
    const customPlaceholder = 'Ask about your budget...';
    render(<ChatInput onSubmit={mockOnSubmit} placeholder={customPlaceholder} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', customPlaceholder);
  });

  it('should render submit button with send icon', () => {
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByTestId('submit-button');
    const sendIcon = screen.getByTestId('send-icon');
    
    expect(submitButton).toBeInTheDocument();
    expect(sendIcon).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('aria-label', 'Send');
  });

  it('should handle text input correctly', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'What is my budget?');
    
    expect(textarea).toHaveValue('What is my budget?');
  });

  it('should submit message when submit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByTestId('submit-button');
    
    await user.type(textarea, 'How can I save money?');
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith('How can I save money?');
    expect(textarea).toHaveValue('');
  });

  it('should submit message when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'What are my expenses?');
    await user.keyboard('{Enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledWith('What are my expenses?');
    expect(textarea).toHaveValue('');
  });

  it('should not submit when Shift+Enter is pressed (new line)', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'First line');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(textarea, 'Second line');
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('First line\nSecond line');
  });

  it('should not submit empty or whitespace-only messages', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByTestId('submit-button');
    
    // Test empty string
    await user.click(submitButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Test whitespace-only
    await user.type(textarea, '   ');
    await user.click(submitButton);
    expect(mockOnSubmit).not.toHaveBeenCalled();
    
    // Test tabs and spaces
    await user.clear(textarea);
    await user.type(textarea, '\t  \n  ');
    await user.keyboard('{Enter}');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should trim whitespace from submitted messages', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '  How much should I invest?  ');
    await user.keyboard('{Enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledWith('How much should I invest?');
  });

  it('should disable input and button when disabled prop is true', () => {
    render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByTestId('submit-button');
    
    expect(textarea).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should not submit when disabled', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByTestId('submit-button');
    
    // Try typing (should not work due to disabled)
    await user.type(textarea, 'This should not work');
    await user.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should disable submit button when input is empty', () => {
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when input has content', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByTestId('submit-button');
    
    expect(submitButton).toBeDisabled();
    
    await user.type(textarea, 'Some content');
    expect(submitButton).not.toBeDisabled();
  });

  it('should auto-resize textarea based on content', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    
    // Mock scrollHeight behavior
    Object.defineProperty(textarea, 'scrollHeight', {
      get: () => 100,
      configurable: true,
    });
    
    await user.type(textarea, 'Long message that should resize the textarea');
    
    // Trigger the input event manually since jsdom doesn't do this automatically
    fireEvent.input(textarea);
    
    expect(textarea.style.height).toBe('100px');
  });

  it('should have proper CSS classes for styling', () => {
    const { container } = render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const mainContainer = container.querySelector('div');
    const textarea = screen.getByRole('textbox');
    
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'gap-2', 'rounded-2xl', 'border', 'bg-white', 'p-4', 'shrink-0');
    expect(textarea).toHaveClass('w-full', 'resize-none', 'outline-none', 'overflow-y-auto', 'max-h-[250px]', 'disabled:opacity-50');
  });

  it('should use translation hook correctly', () => {
    // Verify that the component uses translations correctly by checking rendered content
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('placeholder', 'Ask me about your financial goals, budgeting, investing, or any money-related questions...');
    
    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toHaveAttribute('aria-label', 'Send');
  });

  it('should handle keyboard navigation correctly', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByTestId('submit-button');
    
    await user.type(textarea, 'Test message');
    await user.tab();
    
    expect(submitButton).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(mockOnSubmit).toHaveBeenCalledWith('Test message');
  });

  it('should handle special characters in input', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    const specialMessage = 'How much is 10% of $1,000? 🤔';
    
    await user.type(textarea, specialMessage);
    await user.keyboard('{Enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledWith(specialMessage);
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSubmit={mockOnSubmit} />);
    
    const textarea = screen.getByRole('textbox');
    
    await user.type(textarea, 'First message');
    await user.keyboard('{Enter}');
    
    expect(textarea).toHaveValue('');
    
    await user.type(textarea, 'Second message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    expect(mockOnSubmit).toHaveBeenNthCalledWith(1, 'First message');
    expect(mockOnSubmit).toHaveBeenNthCalledWith(2, 'Second message');
  });
});