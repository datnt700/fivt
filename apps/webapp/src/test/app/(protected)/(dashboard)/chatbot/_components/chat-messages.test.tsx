import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { ChatMessages } from '@/app/(protected)/(dashboard)/chatbot/_components/chat-messages';
import { ChatMessage } from '@/app/(protected)/(dashboard)/chatbot/_types';

// Mock child components
vi.mock('@/app/(protected)/(dashboard)/chatbot/_components/chat-message-item', () => ({
  ChatMessageItem: ({ message, index }: { message: ChatMessage; index: number }) => (
    <div data-testid={`message-item-${index}`}>
      <div>Question: {message.question}</div>
      <div>Answer: {message.answer || 'Loading...'}</div>
      <div>Loading: {message.loading.toString()}</div>
    </div>
  ),
}));

vi.mock('@/app/(protected)/(dashboard)/chatbot/_components/chat-welcome', () => ({
  ChatWelcome: ({ message }: { message?: string }) => (
    <div data-testid="chat-welcome">
      {message || 'Default welcome message'}
    </div>
  ),
}));

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

describe('ChatMessages', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: 1,
      question: 'What is my current budget?',
      answer: 'Your monthly budget is $3,000.',
      loading: false,
    },
    {
      id: 2,
      question: 'How can I save more money?',
      answer: null,
      loading: true,
    },
    {
      id: 3,
      question: 'What are my biggest expenses?',
      answer: 'Your biggest expenses are housing (40%) and food (25%).',
      loading: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollIntoView.mockClear();
  });

  it('should render welcome message when no messages exist', () => {
    render(<ChatMessages messages={[]} />);
    
    const welcomeComponent = screen.getByTestId('chat-welcome');
    expect(welcomeComponent).toBeInTheDocument();
    expect(welcomeComponent).toHaveTextContent('Default welcome message');
  });

  it('should render custom welcome message when provided', () => {
    const customWelcome = 'Welcome to your financial assistant!';
    render(<ChatMessages messages={[]} welcomeMessage={customWelcome} />);
    
    const welcomeComponent = screen.getByTestId('chat-welcome');
    expect(welcomeComponent).toHaveTextContent(customWelcome);
  });

  it('should render all messages when messages exist', () => {
    render(<ChatMessages messages={mockMessages} />);
    
    // Should not show welcome when messages exist
    expect(screen.queryByTestId('chat-welcome')).not.toBeInTheDocument();
    
    // Should render all message items
    mockMessages.forEach((message, index) => {
      const messageItem = screen.getByTestId(`message-item-${index}`);
      expect(messageItem).toBeInTheDocument();
      expect(messageItem).toHaveTextContent(`Question: ${message.question}`);
      expect(messageItem).toHaveTextContent(`Loading: ${message.loading.toString()}`);
      
      if (message.answer) {
        expect(messageItem).toHaveTextContent(`Answer: ${message.answer}`);
      } else {
        expect(messageItem).toHaveTextContent('Answer: Loading...');
      }
    });
  });

  it('should render messages in correct order', () => {
    render(<ChatMessages messages={mockMessages} />);
    
    const messageItems = screen.getAllByTestId(/message-item-/);
    expect(messageItems).toHaveLength(3);
    
    expect(messageItems[0]).toHaveTextContent('What is my current budget?');
    expect(messageItems[1]).toHaveTextContent('How can I save more money?');
    expect(messageItems[2]).toHaveTextContent('What are my biggest expenses?');
  });

  it('should handle single message', () => {
    const singleMessage = [mockMessages[0]!];
    render(<ChatMessages messages={singleMessage} />);
    
    expect(screen.getByTestId('message-item-0')).toBeInTheDocument();
    expect(screen.queryByTestId('message-item-1')).not.toBeInTheDocument();
  });

  it('should handle loading messages correctly', () => {
    const loadingMessage: ChatMessage = {
      id: 4,
      question: 'What should I invest in?',
      answer: null,
      loading: true,
    };
    
    render(<ChatMessages messages={[loadingMessage]} />);
    
    const messageItem = screen.getByTestId('message-item-0');
    expect(messageItem).toHaveTextContent('Loading: true');
    expect(messageItem).toHaveTextContent('Answer: Loading...');
  });

  it('should handle completed messages correctly', () => {
    const completedMessage: ChatMessage = {
      id: 5,
      question: 'How much should I save?',
      answer: 'You should save at least 20% of your income.',
      loading: false,
    };
    
    render(<ChatMessages messages={[completedMessage]} />);
    
    const messageItem = screen.getByTestId('message-item-0');
    expect(messageItem).toHaveTextContent('Loading: false');
    expect(messageItem).toHaveTextContent('Answer: You should save at least 20% of your income.');
  });

  it('should scroll to bottom when messages change', () => {
    const { rerender } = render(<ChatMessages messages={[mockMessages[0]!]} />);

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    mockScrollIntoView.mockClear();

    // Add new message
    rerender(<ChatMessages messages={[mockMessages[0]!, mockMessages[1]!]} />);    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should scroll to bottom on initial render with messages', () => {
    render(<ChatMessages messages={mockMessages} />);
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('should not scroll when rendering empty messages', () => {
    render(<ChatMessages messages={[]} />);
    
    // Should not scroll when there are no messages (no bottom spacer)
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('should have proper container styling', () => {
    const { container } = render(<ChatMessages messages={mockMessages} />);
    
    const mainDiv = container.querySelector('div');
    expect(mainDiv).toHaveClass('h-full', 'overflow-y-auto', 'pb-6', 'w-full');
  });

  it('should render bottom spacer element', () => {
    const { container } = render(<ChatMessages messages={mockMessages} />);
    
    const spacer = container.querySelector('div[class="h-4"]');
    expect(spacer).toBeInTheDocument();
  });

  it('should not render bottom spacer when no messages', () => {
    const { container } = render(<ChatMessages messages={[]} />);
    
    const spacer = container.querySelector('div[class="h-4"]');
    expect(spacer).not.toBeInTheDocument();
  });

  it('should handle messages with special characters', () => {
    const specialMessage: ChatMessage = {
      id: 6,
      question: 'How much is 15% of $2,500? 💰',
      answer: 'That would be $375. 📊',
      loading: false,
    };
    
    render(<ChatMessages messages={[specialMessage]} />);
    
    const messageItem = screen.getByTestId('message-item-0');
    expect(messageItem).toHaveTextContent('How much is 15% of $2,500? 💰');
    expect(messageItem).toHaveTextContent('That would be $375. 📊');
  });

  it('should handle messages with empty strings', () => {
    const emptyMessage: ChatMessage = {
      id: 7,
      question: '',
      answer: '',
      loading: false,
    };
    
    render(<ChatMessages messages={[emptyMessage]} />);
    
    const messageItem = screen.getByTestId('message-item-0');
    expect(messageItem).toHaveTextContent('Question:');
    expect(messageItem).toHaveTextContent('Answer:');
  });

  it('should pass correct props to ChatMessageItem', () => {
    render(<ChatMessages messages={[mockMessages[0]!]} />);
    
    const messageItem = screen.getByTestId('message-item-0');
    expect(messageItem).toHaveTextContent('Question: What is my current budget?');
    expect(messageItem).toHaveTextContent('Answer: Your monthly budget is $3,000.');
    expect(messageItem).toHaveTextContent('Loading: false');
  });

  it('should pass correct props to ChatWelcome', () => {
    const welcomeMessage = 'Get started with your financial questions';
    render(<ChatMessages messages={[]} welcomeMessage={welcomeMessage} />);
    
    const welcomeComponent = screen.getByTestId('chat-welcome');
    expect(welcomeComponent).toHaveTextContent(welcomeMessage);
  });

  it('should handle mixed loading states in messages', () => {
    const mixedMessages: ChatMessage[] = [
      { id: 1, question: 'Question 1', answer: 'Answer 1', loading: false },
      { id: 2, question: 'Question 2', answer: null, loading: true },
      { id: 3, question: 'Question 3', answer: 'Answer 3', loading: false },
    ];
    
    render(<ChatMessages messages={mixedMessages} />);
    
    expect(screen.getByTestId('message-item-0')).toHaveTextContent('Loading: false');
    expect(screen.getByTestId('message-item-1')).toHaveTextContent('Loading: true');
    expect(screen.getByTestId('message-item-2')).toHaveTextContent('Loading: false');
  });

  it('should handle large number of messages', () => {
    const manyMessages: ChatMessage[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      loading: false,
    }));
    
    render(<ChatMessages messages={manyMessages} />);
    
    const messageItems = screen.getAllByTestId(/message-item-/);
    expect(messageItems).toHaveLength(50);
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});