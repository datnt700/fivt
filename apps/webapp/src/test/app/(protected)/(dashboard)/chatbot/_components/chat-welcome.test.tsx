import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { ChatWelcome } from '@/app/(protected)/(dashboard)/chatbot/_components/chat-welcome';

// Mock next-intl
const mockTranslations = {
  'welcomeMessage': 'Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    return mockTranslations[key as keyof typeof mockTranslations] || key;
  }),
}));

describe('ChatWelcome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render default welcome message when no custom message provided', () => {
    render(<ChatWelcome />);
    
    const welcomeText = screen.getByText('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?');
    expect(welcomeText).toBeInTheDocument();
  });

  it('should render custom message when provided', () => {
    const customMessage = 'Welcome to your personal financial advisor!';
    render(<ChatWelcome message={customMessage} />);
    
    const customText = screen.getByText(customMessage);
    expect(customText).toBeInTheDocument();
    expect(screen.queryByText('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?')).not.toBeInTheDocument();
  });

  it('should render waving hand emoji', () => {
    render(<ChatWelcome />);
    
    const emoji = screen.getByText('👋');
    expect(emoji).toBeInTheDocument();
  });

  it('should have proper container styling', () => {
    const { container } = render(<ChatWelcome />);
    
    // The outer container should have flex styling
    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).toHaveClass('flex', 'items-center', 'justify-center', 'h-full', 'p-4');
    
    // The inner container should have text styling
    const innerContainer = outerContainer.firstChild as HTMLElement;
    expect(innerContainer).toHaveClass('text-center', 'text-gray-600');
  });

  it('should have proper emoji styling', () => {
    render(<ChatWelcome />);
    
    const emojiElement = screen.getByText('👋');
    const emojiContainer = emojiElement.closest('p');
    expect(emojiContainer).toHaveClass('text-lg', 'mb-2');
  });

  it('should handle empty string message', () => {
    render(<ChatWelcome message="" />);
    
    // Should render the default translation when empty string provided
    expect(screen.getByText('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?')).toBeInTheDocument();
  });

  it('should handle whitespace-only message', () => {
    const whitespaceMessage = '   \n   \t   ';
    const { container } = render(<ChatWelcome message={whitespaceMessage} />);
    
    // Check that the whitespace message is rendered (may be normalized by DOM)
    const messageElement = container.querySelector('p:nth-child(2)');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement?.textContent).toContain(whitespaceMessage.trim() || whitespaceMessage);
  });

  it('should handle long custom messages', () => {
    const longMessage = 'Welcome to your comprehensive financial management system. Here you can ask questions about budgeting, savings, investments, expenses, and get personalized financial advice tailored to your specific situation.';
    render(<ChatWelcome message={longMessage} />);
    
    const messageText = screen.getByText(longMessage);
    expect(messageText).toBeInTheDocument();
  });

  it('should handle messages with special characters', () => {
    const specialMessage = 'Welcome! 🤖 Ready to talk about $ & finances? Let\'s go! 📊💰';
    render(<ChatWelcome message={specialMessage} />);
    
    const messageText = screen.getByText(specialMessage);
    expect(messageText).toBeInTheDocument();
  });

  it('should handle messages with HTML-like content', () => {
    const htmlLikeMessage = 'Welcome to <YourBank> Financial Assistant!';
    render(<ChatWelcome message={htmlLikeMessage} />);
    
    const messageText = screen.getByText(htmlLikeMessage);
    expect(messageText).toBeInTheDocument();
  });

  it('should handle multiline custom messages', () => {
    const multilineMessage = 'Welcome to your financial assistant!\n\nI can help you with:\n• Budget planning\n• Expense tracking\n• Investment advice';
    const { container } = render(<ChatWelcome message={multilineMessage} />);
    
    // Check that multiline content is rendered (DOM may normalize spacing)
    const messageElement = container.querySelector('p:nth-child(2)');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement?.textContent).toContain('Welcome to your financial assistant!');
    expect(messageElement?.textContent).toContain('Budget planning');
  });

  it('should use translation hook correctly', () => {
    // Verify that the component uses translations correctly by checking rendered content
    render(<ChatWelcome />);
    
    // Verify that the default translation is rendered
    expect(screen.getByText('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?')).toBeInTheDocument();
  });

  it('should render content when no custom message provided', () => {
    render(<ChatWelcome />);
    
    // Should render the default welcome message from our mock
    expect(screen.getByText('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?')).toBeInTheDocument();
  });

  it('should render semantic HTML structure', () => {
    const { container } = render(<ChatWelcome />);
    
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    
    // First paragraph contains emoji
    expect(paragraphs[0]).toHaveTextContent('👋');
    
    // Second paragraph contains message
    expect(paragraphs[1]).toHaveTextContent('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?');
  });

  it('should be accessible with proper text content', () => {
    render(<ChatWelcome message="Welcome to your financial helper!" />);
    
    // Should be readable by screen readers
    const messageText = screen.getByText('Welcome to your financial helper!');
    expect(messageText).toBeInTheDocument();
    
    const emoji = screen.getByText('👋');
    expect(emoji).toBeInTheDocument();
  });

  it('should center content properly', () => {
    const { container } = render(<ChatWelcome />);
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center');
    
    const textContainer = mainContainer.firstChild as HTMLElement;
    expect(textContainer).toHaveClass('text-center');
  });

  it('should handle different message types consistently', () => {
    const messages = [
      'Short message',
      'A much longer message that spans multiple words and contains various punctuation marks!',
      '123',
      'Message with 数字 and émojis 🎉',
      null, // Should use default
      undefined, // Should use default
    ];
    
    messages.forEach((message) => {
      const { rerender } = render(<ChatWelcome message={message || undefined} />);
      
      if (message) {
        expect(screen.getByText(message)).toBeInTheDocument();
      } else {
        expect(screen.getByText('Hello! I\'m your Fivt assistant. How can I help you with your financial goals today?')).toBeInTheDocument();
      }
      
      // Emoji should always be present
      expect(screen.getByText('👋')).toBeInTheDocument();
      
      // Clean up for next iteration
      rerender(<div />);
    });
  });

  it('should maintain consistent layout regardless of message length', () => {
    const shortMessage = 'Hi!';
    const longMessage = 'This is a very long welcome message that should still maintain the same layout and styling as shorter messages, ensuring consistent user experience across different content lengths.';
    
    const { container, rerender } = render(<ChatWelcome message={shortMessage} />);
    
    const initialContainer = container.firstChild as HTMLElement;
    const initialInnerContainer = initialContainer.firstChild as HTMLElement;
    
    expect(initialContainer).toHaveClass('flex', 'items-center', 'justify-center', 'h-full', 'p-4');
    expect(initialInnerContainer).toHaveClass('text-center', 'text-gray-600');
    
    rerender(<ChatWelcome message={longMessage} />);
    
    const updatedContainer = container.firstChild as HTMLElement;
    const updatedInnerContainer = updatedContainer.firstChild as HTMLElement;
    
    expect(updatedContainer).toHaveClass('flex', 'items-center', 'justify-center', 'h-full', 'p-4');
    expect(updatedInnerContainer).toHaveClass('text-center', 'text-gray-600');
  });

  it('should preserve emoji presentation across different messages', () => {
    const messages = ['First message', 'Second message', 'Third message'];
    
    messages.forEach(message => {
      const { rerender } = render(<ChatWelcome message={message} />);
      
      const emoji = screen.getByText('👋');
      const emojiContainer = emoji.closest('p');
      
      expect(emoji).toBeInTheDocument();
      expect(emojiContainer).toHaveClass('text-lg', 'mb-2');
      
      rerender(<div />);
    });
  });
});