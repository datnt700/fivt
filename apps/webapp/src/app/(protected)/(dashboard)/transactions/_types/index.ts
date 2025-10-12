export interface Transaction {
  id: number;
  account_id: number;
  date: string;
  value: number;
  gross_value: number;
  original_wording: string;
  simplified_wording: string;
  category: {
    id: number;
    name: string;
  };
  accountName?: string;
  accountId?: number;
}

export interface ManualTransaction {
  id: string;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
}

export interface MonthOption {
  value: string;
  label: string;
}