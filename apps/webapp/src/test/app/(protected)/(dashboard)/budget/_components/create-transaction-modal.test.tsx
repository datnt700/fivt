import { screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CreateTransactionModal } from '@/app/(protected)/(dashboard)/budget/_components/create-transaction-modal';
import { renderWithQueryClient } from '@/test/common/utils';

// Mock next-intl
const mockTranslations = {
  'budget.addTransaction': 'Add Transaction',
};

vi.mock('next-intl', () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => {
    const fullKey = `${namespace}.${key}`;
    return mockTranslations[fullKey as keyof typeof mockTranslations] || key;
  }),
  useLocale: vi.fn(() => 'en'),
}));

// Mock the CreateTransactionForm component since the modal just wraps it
vi.mock(
  '@/app/(protected)/(dashboard)/budget/_components/create-transaction-form',
  () => ({
    CreateTransactionForm: vi.fn(
      ({ onSuccess }: { onSuccess?: () => void }) => (
        <div data-testid="create-transaction-form">
          <button onClick={onSuccess} data-testid="form-success-trigger">
            Trigger Success
          </button>
        </div>
      )
    ),
  })
);

describe('CreateTransactionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  it('should render modal when open', () => {
    renderWithQueryClient(<CreateTransactionModal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Transaction')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    renderWithQueryClient(
      <CreateTransactionModal {...defaultProps} isOpen={false} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the CreateTransactionForm component', () => {
    renderWithQueryClient(<CreateTransactionModal {...defaultProps} />);

    expect(screen.getByTestId('create-transaction-form')).toBeInTheDocument();
  });

  it('should close modal when onClose is called', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithQueryClient(
      <CreateTransactionModal {...defaultProps} onClose={onClose} />
    );

    // Test ESC key to close
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onSuccess and onClose when form succeeds', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    renderWithQueryClient(
      <CreateTransactionModal
        {...defaultProps}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    );

    // Trigger form success
    await user.click(screen.getByTestId('form-success-trigger'));

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
