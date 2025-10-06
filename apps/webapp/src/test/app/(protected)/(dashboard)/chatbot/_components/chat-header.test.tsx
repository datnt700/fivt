import { render, screen } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { ChatHeader } from '@/app/(protected)/(dashboard)/chatbot/_components/chat-header';

// Mock next-intl
const mockTranslations = {
  'title': 'Fivt Assistant',
  'subtitle': 'Get personalized financial advice and strategies',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    return mockTranslations[key as keyof typeof mockTranslations] || key;
  }),
}));

describe('ChatHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with default title and subtitle', () => {
    render(<ChatHeader />);
    
    expect(screen.getByText('Fivt Assistant')).toBeInTheDocument();
    expect(screen.getByText('Get personalized financial advice and strategies')).toBeInTheDocument();
  });

  it('should render custom title when provided', () => {
    const customTitle = 'Custom Chat Title';
    render(<ChatHeader title={customTitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.queryByText('Fivt Assistant')).not.toBeInTheDocument();
  });

  it('should render custom subtitle when provided', () => {
    const customSubtitle = 'Custom subtitle for chat';
    render(<ChatHeader subtitle={customSubtitle} />);
    
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
    expect(screen.queryByText('Get personalized financial advice and strategies')).not.toBeInTheDocument();
  });

  it('should render both custom title and subtitle', () => {
    const customTitle = 'AI Financial Advisor';
    const customSubtitle = 'Get personalized financial guidance';
    
    render(<ChatHeader title={customTitle} subtitle={customSubtitle} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
    expect(screen.queryByText('Fivt Assistant')).not.toBeInTheDocument();
    expect(screen.queryByText('Get personalized financial advice and strategies')).not.toBeInTheDocument();
  });

  it('should have proper header structure and styling', () => {
    const { container } = render(<ChatHeader />);
    
    const headerContainer = container.querySelector('div');
    expect(headerContainer).toHaveClass('flex', 'flex-col', 'p-4', 'border-b', 'bg-white', 'shrink-0');
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-xl', 'font-semibold', 'text-gray-900');
    
    const subtitle = screen.getByText('Get personalized financial advice and strategies');
    expect(subtitle).toHaveClass('text-sm', 'text-gray-600');
  });

  it('should handle empty string props', () => {
    render(<ChatHeader title="" subtitle="" />);
    
    // Should render the translations when empty strings provided
    expect(screen.getByText('Fivt Assistant')).toBeInTheDocument();
    expect(screen.getByText('Get personalized financial advice and strategies')).toBeInTheDocument();
  });

  it('should handle special characters in custom props', () => {
    const titleWithSpecialChars = 'AI & Financial Advisor 🤖';
    const subtitleWithSpecialChars = 'Questions & Answers (24/7)';
    
    render(<ChatHeader title={titleWithSpecialChars} subtitle={subtitleWithSpecialChars} />);
    
    expect(screen.getByText(titleWithSpecialChars)).toBeInTheDocument();
    expect(screen.getByText(subtitleWithSpecialChars)).toBeInTheDocument();
  });

  it('should use translation hook correctly', () => {
    // This test verifies that the component uses translations correctly by checking rendered content
    render(<ChatHeader />);
    
    // Verify that the default translations are rendered
    expect(screen.getByText('Fivt Assistant')).toBeInTheDocument();
    expect(screen.getByText('Get personalized financial advice and strategies')).toBeInTheDocument();
  });

  it('should render semantic HTML structure', () => {
    const { container } = render(<ChatHeader />);
    
    // Should have proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // Paragraph for subtitle
    const subtitle = container.querySelector('p');
    expect(subtitle).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA structure', () => {
    render(<ChatHeader title="Custom Title" subtitle="Custom Subtitle" />);
    
    const heading = screen.getByRole('heading', { name: 'Custom Title' });
    expect(heading).toBeInTheDocument();
  });
});