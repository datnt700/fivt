import { describe, it, expect } from 'vitest';
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from '@/app/(protected)/(dashboard)/budget/_validations/transaction-schema';
import { ZodError } from 'zod';

describe('createTransactionSchema', () => {
  const validTransactionData: CreateTransactionFormValues = {
    date: '2024-01-01',
    amount: 100.5,
    type: 'EXPENSE',
    categoryId: 'category-1',
    description: 'Test transaction',
  };

  describe('valid data', () => {
    it('should validate a complete valid transaction', () => {
      const result = createTransactionSchema.parse(validTransactionData);

      expect(result).toEqual(validTransactionData);
    });

    it('should validate transaction without description', () => {
      const transactionWithoutDescription = {
        ...validTransactionData,
        description: undefined,
      };

      const result = createTransactionSchema.parse(
        transactionWithoutDescription
      );

      expect(result).toEqual({
        date: '2024-01-01',
        amount: 100.5,
        type: 'EXPENSE',
        categoryId: 'category-1',
      });
    });

    it('should validate INCOME transaction type', () => {
      const incomeTransaction = {
        ...validTransactionData,
        type: 'INCOME' as const,
      };

      const result = createTransactionSchema.parse(incomeTransaction);

      expect(result.type).toBe('INCOME');
    });

    it('should validate EXPENSE transaction type', () => {
      const expenseTransaction = {
        ...validTransactionData,
        type: 'EXPENSE' as const,
      };

      const result = createTransactionSchema.parse(expenseTransaction);

      expect(result.type).toBe('EXPENSE');
    });

    it('should coerce string numbers to numbers', () => {
      const transactionWithStringAmount = {
        ...validTransactionData,
        amount: '150.75' as unknown as number,
      };

      const result = createTransactionSchema.parse(transactionWithStringAmount);

      expect(result.amount).toBe(150.75);
      expect(typeof result.amount).toBe('number');
    });

    it('should handle decimal amounts', () => {
      const decimalAmounts = [0.01, 99.99, 1000.5, 12345.67];

      decimalAmounts.forEach(amount => {
        const transaction = {
          ...validTransactionData,
          amount,
        };

        const result = createTransactionSchema.parse(transaction);
        expect(result.amount).toBe(amount);
      });
    });

    it('should handle large amounts', () => {
      const largeTransaction = {
        ...validTransactionData,
        amount: 999999.99,
      };

      const result = createTransactionSchema.parse(largeTransaction);

      expect(result.amount).toBe(999999.99);
    });

    it('should trim description whitespace', () => {
      const transactionWithWhitespace = {
        ...validTransactionData,
        description: '  Test transaction with whitespace  ',
      };

      const result = createTransactionSchema.parse(transactionWithWhitespace);

      expect(result.description).toBe('Test transaction with whitespace');
    });

    it('should handle empty string description', () => {
      const transactionWithEmptyDescription = {
        ...validTransactionData,
        description: '',
      };

      const result = createTransactionSchema.parse(
        transactionWithEmptyDescription
      );

      expect(result.description).toBe('');
    });

    it('should handle maximum length description', () => {
      const maxDescription = 'A'.repeat(200);
      const transactionWithMaxDescription = {
        ...validTransactionData,
        description: maxDescription,
      };

      const result = createTransactionSchema.parse(
        transactionWithMaxDescription
      );

      expect(result.description).toBe(maxDescription);
      expect(result.description?.length).toBe(200);
    });
  });

  describe('invalid data', () => {
    it('should reject missing date', () => {
      const transactionWithoutDate = {
        ...validTransactionData,
        date: '',
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithoutDate)
      ).toThrow(ZodError);

      try {
        createTransactionSchema.parse(transactionWithoutDate);
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.issues[0]?.message).toBe('Select date');
        expect(zodError.issues[0]?.path).toEqual(['date']);
      }
    });

    it('should reject zero amount', () => {
      const transactionWithZeroAmount = {
        ...validTransactionData,
        amount: 0,
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithZeroAmount)
      ).toThrow(ZodError);

      try {
        createTransactionSchema.parse(transactionWithZeroAmount);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues[0]?.message).toBe('Amount must be > 0');
        expect(zodError.issues[0]?.path).toEqual(['amount']);
      }
    });

    it('should reject negative amount', () => {
      const transactionWithNegativeAmount = {
        ...validTransactionData,
        amount: -50,
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithNegativeAmount)
      ).toThrow(ZodError);

      try {
        createTransactionSchema.parse(transactionWithNegativeAmount);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues[0]?.message).toBe('Amount must be > 0');
      }
    });

    it('should reject invalid transaction type', () => {
      const transactionWithInvalidType = {
        ...validTransactionData,
        type: 'INVALID' as unknown as 'INCOME' | 'EXPENSE',
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithInvalidType)
      ).toThrow(ZodError);

      try {
        createTransactionSchema.parse(transactionWithInvalidType);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues[0]?.code).toBe('invalid_enum_value');
        expect(zodError.issues[0]?.path).toEqual(['type']);
      }
    });

    it('should reject empty category ID', () => {
      const transactionWithoutCategory = {
        ...validTransactionData,
        categoryId: '',
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithoutCategory)
      ).toThrow(ZodError);

      try {
        createTransactionSchema.parse(transactionWithoutCategory);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues[0]?.message).toBe('Choose a category');
        expect(zodError.issues[0]?.path).toEqual(['categoryId']);
      }
    });

    it('should reject missing category ID', () => {
      const transactionWithoutCategoryId = {
        ...validTransactionData,
        categoryId: undefined as unknown as string,
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithoutCategoryId)
      ).toThrow(ZodError);
    });

    it('should reject description longer than 200 characters', () => {
      const longDescription = 'A'.repeat(201);
      const transactionWithLongDescription = {
        ...validTransactionData,
        description: longDescription,
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithLongDescription)
      ).toThrow(ZodError);

      try {
        createTransactionSchema.parse(transactionWithLongDescription);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues[0]?.code).toBe('too_big');
        expect(zodError.issues[0]?.path).toEqual(['description']);
      }
    });

    it('should reject non-numeric amount strings', () => {
      const transactionWithInvalidAmount = {
        ...validTransactionData,
        amount: 'not-a-number' as unknown as number,
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithInvalidAmount)
      ).toThrow(ZodError);
    });

    it('should handle multiple validation errors', () => {
      const invalidTransaction = {
        date: '',
        amount: -10,
        type: 'INVALID' as unknown as 'INCOME' | 'EXPENSE',
        categoryId: '',
        description: 'A'.repeat(201),
      };

      try {
        createTransactionSchema.parse(invalidTransaction);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.issues).toHaveLength(5);

        const errorPaths = zodError.issues.map(issue => issue.path[0]);
        expect(errorPaths).toContain('date');
        expect(errorPaths).toContain('amount');
        expect(errorPaths).toContain('type');
        expect(errorPaths).toContain('categoryId');
        expect(errorPaths).toContain('description');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      const transactionWithNulls = {
        date: null as unknown as string,
        amount: null as unknown as number,
        type: null as unknown as 'INCOME' | 'EXPENSE',
        categoryId: null as unknown as string,
        description: null as unknown as string,
      };

      expect(() => createTransactionSchema.parse(transactionWithNulls)).toThrow(
        ZodError
      );
    });

    it('should handle undefined values', () => {
      const transactionWithUndefined = {
        date: undefined as unknown as string,
        amount: undefined as unknown as number,
        type: undefined as unknown as 'INCOME' | 'EXPENSE',
        categoryId: undefined as unknown as string,
        description: undefined, // This should be valid
      };

      expect(() =>
        createTransactionSchema.parse(transactionWithUndefined)
      ).toThrow(ZodError);
    });

    it('should handle empty object', () => {
      expect(() => createTransactionSchema.parse({})).toThrow(ZodError);
    });

    it('should handle extra properties', () => {
      const transactionWithExtra = {
        ...validTransactionData,
        extraProperty: 'should be ignored',
      };

      const result = createTransactionSchema.parse(transactionWithExtra);

      expect(result).not.toHaveProperty('extraProperty');
      expect(result).toEqual(validTransactionData);
    });

    it('should handle scientific notation amounts', () => {
      const transactionWithScientificNotation = {
        ...validTransactionData,
        amount: 1e2, // 100
      };

      const result = createTransactionSchema.parse(
        transactionWithScientificNotation
      );

      expect(result.amount).toBe(100);
    });

    it('should handle floating point precision', () => {
      const transactionWithFloatingPoint = {
        ...validTransactionData,
        amount: 0.1 + 0.2, // 0.30000000000000004
      };

      const result = createTransactionSchema.parse(
        transactionWithFloatingPoint
      );

      expect(result.amount).toBeCloseTo(0.3);
    });

    it('should handle whitespace-only description after trim', () => {
      const transactionWithWhitespaceDescription = {
        ...validTransactionData,
        description: '   ',
      };

      const result = createTransactionSchema.parse(
        transactionWithWhitespaceDescription
      );

      expect(result.description).toBe('');
    });
  });

  describe('type safety', () => {
    it('should infer correct TypeScript types', () => {
      const result = createTransactionSchema.parse(validTransactionData);

      // TypeScript type checking
      const date: string = result.date;
      const amount: number = result.amount;
      const type: 'INCOME' | 'EXPENSE' = result.type;
      const categoryId: string = result.categoryId;
      const description: string | undefined = result.description;

      expect(typeof date).toBe('string');
      expect(typeof amount).toBe('number');
      expect(['INCOME', 'EXPENSE']).toContain(type);
      expect(typeof categoryId).toBe('string');
      expect(description === undefined || typeof description === 'string').toBe(
        true
      );
    });
  });
});
