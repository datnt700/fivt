import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateTransactionFormCard } from '@/app/(protected)/(dashboard)/budget/_components/create-transaction-form-card';
import { renderWithQueryClient } from '../../../../../utils/query-client-wrapper';

// Mock next-intl
const mockTranslations = {
  'transactions.addManualTitle': 'Add Manual Transaction',
  'transactions.addManualSubtitle': 'Track your manual income and expenses',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return (
      mockTranslations[fullKey as keyof typeof mockTranslations] || fullKey
    );
  }),
}));

// Mock the child form component to isolate testing
vi.mock(
  '@/app/(protected)/(dashboard)/budget/_components/create-transaction-form',
  () => ({
    CreateTransactionForm: () => (
      <div data-testid="create-transaction-form">
        Mock Create Transaction Form
      </div>
    ),
  })
);

describe('CreateTransactionFormCard', () => {
  describe('Component Rendering', () => {
    it('should render card with correct structure', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Check card structure
      const cardTitle = screen.getByRole('heading', { level: 3 });
      expect(cardTitle).toBeInTheDocument();
      expect(cardTitle).toHaveTextContent('Add Manual Transaction');

      // Check card description
      const cardDescription = screen.getByText(
        'Track your manual income and expenses'
      );
      expect(cardDescription).toBeInTheDocument();
    });

    it('should render the CreateTransactionForm component', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      const form = screen.getByTestId('create-transaction-form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveTextContent('Mock Create Transaction Form');
    });

    it('should use correct translation keys', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Verify translation keys are used
      expect(screen.getByText('Add Manual Transaction')).toBeInTheDocument();
      expect(
        screen.getByText('Track your manual income and expenses')
      ).toBeInTheDocument();
    });
  });

  describe('UI Components', () => {
    it('should render Card component with correct styling classes', () => {
      const { container } = renderWithQueryClient(
        <CreateTransactionFormCard />
      );

      // Check for card-related classes (shadcn/ui Card components)
      const cardElement = container.querySelector('[class*="card"]');
      expect(cardElement).toBeInTheDocument();
    });

    it('should render CardHeader with title and description', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Check for card header structure
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();

      // Check for description
      const description = screen.getByText(
        'Track your manual income and expenses'
      );
      expect(description).toBeInTheDocument();
    });

    it('should render CardContent with form', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Check that form is wrapped in card content
      const form = screen.getByTestId('create-transaction-form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Check for proper heading hierarchy
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Add Manual Transaction');
    });

    it('should have accessible form label association', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Form should be present and accessible
      const form = screen.getByTestId('create-transaction-form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should properly integrate with the child form component', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Verify the child component is rendered within card structure
      const form = screen.getByTestId('create-transaction-form');
      expect(form).toBeInTheDocument();

      // Verify it's within the card context
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(form).toBeInTheDocument();
    });

    it('should render without any props', () => {
      expect(() => {
        renderWithQueryClient(<CreateTransactionFormCard />);
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle component rendering without errors', () => {
      expect(() => {
        renderWithQueryClient(<CreateTransactionFormCard />);
      }).not.toThrow();
    });

    it('should display all expected content', () => {
      renderWithQueryClient(<CreateTransactionFormCard />);

      // Verify all expected elements are present
      expect(screen.getByText('Add Manual Transaction')).toBeInTheDocument();
      expect(
        screen.getByText('Track your manual income and expenses')
      ).toBeInTheDocument();
      expect(screen.getByTestId('create-transaction-form')).toBeInTheDocument();
    });
  });
});
