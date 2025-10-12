import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { ChatMessageItem } from '@/app/(protected)/(dashboard)/chatbot/_components/chat-message-item';
import { ChatMessage } from '@/app/(protected)/(dashboard)/chatbot/_types';

describe('ChatMessageItem', () => {
  const baseChatMessage: ChatMessage = {
    id: 1,
    question: 'What is my budget?',
    answer: 'Your monthly budget is $3,000.',
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user question in message bubble', () => {
    render(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    const questionText = screen.getByText('What is my budget?');
    expect(questionText).toBeInTheDocument();
    expect(questionText).toHaveClass('text-sm', 'text-gray-700', 'border', 'rounded-xl', 'bg-gray-200');
  });

  it('should render bot answer when not loading', () => {
    render(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    const answerText = screen.getByText('Your monthly budget is $3,000.');
    expect(answerText).toBeInTheDocument();
    expect(answerText).toHaveClass('text-sm', 'text-gray-700', 'border', 'rounded-xl', 'bg-white');
  });

  it('should render loading state when message is loading', () => {
    const loadingMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: true,
    };
    
    const { container } = render(<ChatMessageItem message={loadingMessage} index={0} />);
    
    const loadingText = screen.getByText('Thinking...');
    const loadingSpinner = container.querySelector('svg');
    
    expect(loadingText).toBeInTheDocument();
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('w-4', 'h-4', 'text-gray-400', 'animate-spin');
  });

  it('should not render answer when loading is false and answer is null', () => {
    const noAnswerMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: false,
    };
    
    render(<ChatMessageItem message={noAnswerMessage} index={0} />);
    
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
  });

  it('should not render answer when loading is false and answer is empty string', () => {
    const emptyAnswerMessage: ChatMessage = {
      ...baseChatMessage,
      answer: '',
      loading: false,
    };
    
    const { container } = render(<ChatMessageItem message={emptyAnswerMessage} index={0} />);
    
    // Empty string is falsy, so no answer should be rendered (same as null)
    const answerSpan = container.querySelector('.whitespace-pre-line');
    expect(answerSpan).not.toBeInTheDocument();
    
    // Should still render the question
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
  });

  it('should handle multiline answers correctly', () => {
    const multilineMessage: ChatMessage = {
      ...baseChatMessage,
      answer: 'Here are your budget categories:\n\n1. Housing: $1,200\n2. Food: $600\n3. Transportation: $300',
    };
    
    render(<ChatMessageItem message={multilineMessage} index={0} />);
    
    const answerText = screen.getByText(/Here are your budget categories:/);
    expect(answerText).toBeInTheDocument();
    expect(answerText).toHaveClass('whitespace-pre-line');
  });

  it('should handle long questions with proper text wrapping', () => {
    const longQuestionMessage: ChatMessage = {
      ...baseChatMessage,
      question: 'What is my detailed monthly budget breakdown including all categories like housing, food, transportation, entertainment, savings, utilities, insurance, and miscellaneous expenses?',
    };
    
    render(<ChatMessageItem message={longQuestionMessage} index={0} />);
    
    const questionElement = screen.getByText(longQuestionMessage.question);
    expect(questionElement).toBeInTheDocument();
    expect(questionElement).toHaveClass('break-words');
  });

  it('should handle long answers with proper text wrapping', () => {
    const longAnswerMessage: ChatMessage = {
      ...baseChatMessage,
      answer: 'Your detailed monthly budget breakdown is as follows: Housing costs including rent and utilities total $1,500, food and groceries amount to $600, transportation including gas and car maintenance is $400, entertainment and dining out is $300, savings and investments total $500, insurance premiums are $200, and miscellaneous expenses account for $100, bringing your total monthly budget to $3,600.',
    };
    
    render(<ChatMessageItem message={longAnswerMessage} index={0} />);
    
    const answerElement = screen.getByText(longAnswerMessage.answer!);
    expect(answerElement).toBeInTheDocument();
    expect(answerElement).toHaveClass('break-words');
  });

  it('should handle special characters in question and answer', () => {
    const specialCharsMessage: ChatMessage = {
      ...baseChatMessage,
      question: 'How much is 15% of $2,500? 💰',
      answer: 'That would be $375.00! 📊 Here\'s the calculation: $2,500 × 0.15 = $375',
    };
    
    render(<ChatMessageItem message={specialCharsMessage} index={0} />);
    
    expect(screen.getByText('How much is 15% of $2,500? 💰')).toBeInTheDocument();
    expect(screen.getByText(/That would be \$375\.00! 📊/)).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    const mainContainer = container.querySelector('div');
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'gap-4', 'w-full');
    
    const questionContainer = container.querySelector('.justify-end');
    expect(questionContainer).toHaveClass('flex', 'justify-end', 'mx-3', 'my-3', 'w-full');
    
    const answerContainer = container.querySelector('.justify-start');
    expect(answerContainer).toHaveClass('flex', 'justify-start', 'mx-3', 'my-3', 'w-full');
  });

  it('should apply proper styling to question bubble', () => {
    render(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    const questionElement = screen.getByText('What is my budget?');
    expect(questionElement).toHaveClass(
      'text-sm',
      'text-gray-700',
      'border',
      'rounded-xl',
      'bg-gray-200',
      'px-4',
      'py-3',
      'max-w-[80%]',
      'inline-flex',
      'items-center',
      'min-h-[2.5rem]',
      'leading-relaxed',
      'break-words'
    );
  });

  it('should apply proper styling to answer bubble', () => {
    render(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    const answerElement = screen.getByText('Your monthly budget is $3,000.');
    expect(answerElement).toHaveClass(
      'text-sm',
      'text-gray-700',
      'border',
      'rounded-xl',
      'bg-white',
      'px-4',
      'py-3',
      'max-w-[80%]',
      'inline-flex',
      'items-center',
      'min-h-[2.5rem]',
      'leading-relaxed',
      'whitespace-pre-line',
      'break-words'
    );
  });

  it('should apply proper styling to loading state', () => {
    const loadingMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: true,
    };
    
    const { container } = render(<ChatMessageItem message={loadingMessage} index={0} />);
    
    const loadingContainer = container.querySelector('.bg-white.border.rounded-xl');
    expect(loadingContainer).toHaveClass('bg-white', 'border', 'rounded-xl', 'px-4', 'py-3', 'flex', 'items-center', 'gap-2');
    
    const loadingText = screen.getByText('Thinking...');
    expect(loadingText).toHaveClass('text-sm', 'text-gray-600');
  });

  it('should render with different index values', () => {
    const { rerender } = render(<ChatMessageItem message={baseChatMessage} index={0} />);
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
    
    rerender(<ChatMessageItem message={baseChatMessage} index={5} />);
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
  });

  it('should handle empty question', () => {
    const emptyQuestionMessage: ChatMessage = {
      ...baseChatMessage,
      question: '',
    };
    
    const { container } = render(<ChatMessageItem message={emptyQuestionMessage} index={0} />);
    
    // Check that the question span exists (even if empty)
    const questionSpan = container.querySelector('.break-words');
    expect(questionSpan).toBeInTheDocument();
    expect(questionSpan?.textContent).toBe('');
  });

  it('should handle message with only whitespace in question', () => {
    const whitespaceMessage: ChatMessage = {
      ...baseChatMessage,
      question: '   \n   \t   ',
    };
    
    const { container } = render(<ChatMessageItem message={whitespaceMessage} index={0} />);
    
    // Check that the question span exists with whitespace content
    const questionSpan = container.querySelector('.break-words');
    expect(questionSpan).toBeInTheDocument();
    expect(questionSpan?.textContent).toContain('   ');
  });

  it('should handle message with only whitespace in answer', () => {
    const whitespaceAnswerMessage: ChatMessage = {
      ...baseChatMessage,
      answer: '   \n   \t   ',
    };
    
    const { container } = render(<ChatMessageItem message={whitespaceAnswerMessage} index={0} />);
    
    // Check that the answer span exists with whitespace content
    const answerSpan = container.querySelector('.whitespace-pre-line');
    expect(answerSpan).toBeInTheDocument();  
    expect(answerSpan?.textContent).toContain('   ');
  });

  it('should render loading spinner with correct SVG attributes', () => {
    const loadingMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: true,
    };
    
    const { container } = render(<ChatMessageItem message={loadingMessage} index={0} />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('viewBox', '0 0 100 101');
    expect(spinner).toHaveAttribute('fill', 'none');
    expect(spinner).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  it('should not render bot response section when not loading and no answer', () => {
    const noResponseMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: false,
    };
    
    const { container } = render(<ChatMessageItem message={noResponseMessage} index={0} />);
    
    // Should have question but no answer content
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    
    // Bot response container should be empty
    const botContainer = container.querySelector('.justify-start');
    expect(botContainer?.textContent).toBe('');
  });

  it('should handle transition from loading to completed', () => {
    const loadingMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: true,
    };
    
    const { rerender } = render(<ChatMessageItem message={loadingMessage} index={0} />);
    
    // Should show loading state
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
    expect(screen.queryByText('Your monthly budget is $3,000.')).not.toBeInTheDocument();
    
    // Update to completed state
    rerender(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    // Should show answer and hide loading
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
    expect(screen.getByText('Your monthly budget is $3,000.')).toBeInTheDocument();
  });

  it('should preserve question text during loading state changes', () => {
    const loadingMessage: ChatMessage = {
      ...baseChatMessage,
      answer: null,
      loading: true,
    };
    
    const { rerender } = render(<ChatMessageItem message={loadingMessage} index={0} />);
    
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
    
    rerender(<ChatMessageItem message={baseChatMessage} index={0} />);
    
    expect(screen.getByText('What is my budget?')).toBeInTheDocument();
  });
});