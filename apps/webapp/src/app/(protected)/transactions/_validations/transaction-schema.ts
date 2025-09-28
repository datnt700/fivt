import { z } from 'zod';

export const createTransactionSchema = z.object({
  date: z.string().min(1, 'Select date'),
  amount: z.coerce.number().positive('Amount must be > 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Choose a category'),
  description: z.string().trim().max(200).optional(),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;