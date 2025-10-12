/**
 * Dashboard API Services
 */

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: { name: string } | null;
  createdAt: string;
}

export async function fetchTransactions(date: Date | null): Promise<Transaction[]> {
  const dateStr = date ? date.toISOString().slice(0, 10) : '';
  const response = await fetch(`/api/transactions?date=${dateStr}`, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to load transactions');
  }
  
  return response.json();
}