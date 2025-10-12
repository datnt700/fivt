import type { CreateTransactionFormValues } from '../_validations/transaction-schema';

export const transactionService = {
  async createTransaction(values: CreateTransactionFormValues) {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }

    return response.json();
  },

  async getTransactions(locale?: string) {
    const response = await fetch('/api/transactions', {
      cache: 'no-store',
      headers: locale ? { 'Accept-Language': locale } : {},
    });

    if (!response.ok) {
      throw new Error('Failed to load transactions');
    }

    return response.json();
  },
};
