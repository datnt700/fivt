import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Loading } from '@/components/layout';

// Mock messages for the test
const messages = {
  chatbot: {
    thinking: 'AI is thinking...'
  }
};

const renderWithIntl = (component: React.ReactNode) => {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {component}
    </NextIntlClientProvider>
  );
};

describe('Loading Component', () => {
  it('should render loading spinner', () => {
    renderWithIntl(<Loading />);
    
    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should have accessible loading text', () => {
    renderWithIntl(<Loading />);
    
    // Check for both visible and screen reader text
    const loadingTexts = screen.getAllByText('AI is thinking...');
    expect(loadingTexts).toHaveLength(2); // One visible, one for screen readers
    
    // Check specifically for the visible text
    const visibleText = loadingTexts.find(el => el.classList.contains('text-sm'));
    expect(visibleText).toBeInTheDocument();
    
    // Check specifically for the screen reader text
    const srText = loadingTexts.find(el => el.classList.contains('sr-only'));
    expect(srText).toBeInTheDocument();
  });

  it('should have proper SVG structure', () => {
    const { container } = renderWithIntl(<Loading />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('animate-spin');
  });

  it('should have correct accessibility attributes', () => {
    renderWithIntl(<Loading />);
    
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    
    const srText = screen.getAllByText('AI is thinking...')[1]; // The sr-only one
    expect(srText).toHaveClass('sr-only');
  });
});