import { describe, it, expect } from 'vitest';
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from '@/app/(protected)/(dashboard)/budget/_validations/transaction-schema';
import { ZodError } from 'zod';

describe('Transaction Schema Validation', () => {
  describe('createTransactionSchema', () => {
    const validTransactionData: CreateTransactionFormValues = {
      date: '2024-01-15',
      amount: 150.5,
      type: 'EXPENSE',
      categoryId: 'cat-123',
      description: 'Valid transaction description',
    };

    describe('Valid Data', () => {
      it('should validate correct transaction data', () => {
        const result = createTransactionSchema.parse(validTransactionData);

        expect(result).toEqual(validTransactionData);
        expect(result.date).toBe('2024-01-15');
        expect(result.amount).toBe(150.5);
        expect(result.type).toBe('EXPENSE');
        expect(result.categoryId).toBe('cat-123');
        expect(result.description).toBe('Valid transaction description');
      });

      it('should validate INCOME type transactions', () => {
        const incomeData = {
          ...validTransactionData,
          type: 'INCOME' as const,
          description: 'Salary payment',
        };

        const result = createTransactionSchema.parse(incomeData);

        expect(result.type).toBe('INCOME');
        expect(result.description).toBe('Salary payment');
      });

      it('should validate EXPENSE type transactions', () => {
        const expenseData = {
          ...validTransactionData,
          type: 'EXPENSE' as const,
          description: 'Grocery shopping',
        };

        const result = createTransactionSchema.parse(expenseData);

        expect(result.type).toBe('EXPENSE');
        expect(result.description).toBe('Grocery shopping');
      });

      it('should handle optional description field', () => {
        const dataWithoutDescription = {
          date: '2024-01-15',
          amount: 100,
          type: 'EXPENSE' as const,
          categoryId: 'cat-123',
        };

        const result = createTransactionSchema.parse(dataWithoutDescription);

        expect(result.description).toBeUndefined();
      });

      it('should handle empty description', () => {
        const dataWithEmptyDescription = {
          ...validTransactionData,
          description: '',
        };

        const result = createTransactionSchema.parse(dataWithEmptyDescription);

        expect(result.description).toBe('');
      });

      it('should validate edge case amounts', () => {
        const edgeCaseAmounts = [0.01, 999999.99, 1.005, 50.555, 1];

        edgeCaseAmounts.forEach(amount => {
          const testData = {
            ...validTransactionData,
            amount,
          };

          const result = createTransactionSchema.parse(testData);
          expect(result.amount).toBe(amount);
        });
      });

      it('should handle string amounts that can be coerced to numbers', () => {
        const testCases = [
          { input: '150.50', expected: 150.5 },
          { input: '100', expected: 100 },
          { input: '0.01', expected: 0.01 },
          { input: '999999.99', expected: 999999.99 },
        ];

        testCases.forEach(({ input, expected }) => {
          const testData = {
            ...validTransactionData,
            amount: input as unknown, // TypeScript bypass for testing
          };

          const result = createTransactionSchema.parse(testData);
          expect(result.amount).toBe(expected);
        });
      });

      it('should trim and validate description text', () => {
        const testData = {
          ...validTransactionData,
          description: '  Valid description with spaces  ',
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.description).toBe('Valid description with spaces');
      });

      it('should handle maximum description length', () => {
        const maxDescription = 'A'.repeat(200);
        const testData = {
          ...validTransactionData,
          description: maxDescription,
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.description).toBe(maxDescription);
        expect(result.description?.length).toBe(200);
      });

      it('should handle special characters in description', () => {
        const specialDescription = 'Café & Restaurant - €25.50 (15% tip)';
        const testData = {
          ...validTransactionData,
          description: specialDescription,
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.description).toBe(specialDescription);
      });

      it('should handle Unicode characters in description', () => {
        const unicodeDescription = 'Paiement chez Café Müller 🍰 25,50€';
        const testData = {
          ...validTransactionData,
          description: unicodeDescription,
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.description).toBe(unicodeDescription);
      });
    });

    describe('Date Validation', () => {
      it('should reject empty date', () => {
        const invalidData = {
          ...validTransactionData,
          date: '',
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should reject undefined date', () => {
        const invalidData = {
          ...validTransactionData,
          date: undefined as unknown,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should accept valid date formats', () => {
        const validDates = [
          '2024-01-15',
          '2023-12-31',
          '2024-02-29', // leap year
          '1999-01-01',
        ];

        validDates.forEach(date => {
          const testData = {
            ...validTransactionData,
            date,
          };

          const result = createTransactionSchema.parse(testData);
          expect(result.date).toBe(date);
        });
      });

      it('should handle date edge cases', () => {
        // Note: The schema validates string format, not actual date validity
        const dateStrings = ['2024-01-01', '2024-12-31', '2000-01-01'];

        dateStrings.forEach(date => {
          const testData = {
            ...validTransactionData,
            date,
          };

          expect(() => createTransactionSchema.parse(testData)).not.toThrow();
        });
      });
    });

    describe('Amount Validation Errors', () => {
      it('should reject zero amount', () => {
        const invalidData = {
          ...validTransactionData,
          amount: 0,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should reject negative amounts', () => {
        const negativeAmounts = [-1, -0.01, -999.99];

        negativeAmounts.forEach(amount => {
          const invalidData = {
            ...validTransactionData,
            amount,
          };

          expect(() => createTransactionSchema.parse(invalidData)).toThrow(
            ZodError
          );
        });
      });

      it('should reject non-numeric string amounts', () => {
        const invalidAmounts = ['abc', 'not-a-number', '', '  '];

        invalidAmounts.forEach(amount => {
          const invalidData = {
            ...validTransactionData,
            amount: amount as unknown,
          };

          expect(() => createTransactionSchema.parse(invalidData)).toThrow(
            ZodError
          );
        });
      });

      it('should reject undefined amount', () => {
        const invalidData = {
          ...validTransactionData,
          amount: undefined as unknown,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should reject null amount', () => {
        const invalidData = {
          ...validTransactionData,
          amount: null as unknown,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });
    });

    describe('Type Validation Errors', () => {
      it('should reject invalid transaction types', () => {
        const invalidTypes = [
          'TRANSFER',
          'DEPOSIT',
          'WITHDRAWAL',
          '',
          null,
          undefined,
        ];

        invalidTypes.forEach(type => {
          const invalidData = {
            ...validTransactionData,
            type: type as unknown,
          };

          expect(() => createTransactionSchema.parse(invalidData)).toThrow(
            ZodError
          );
        });
      });

      it('should reject case-sensitive incorrect types', () => {
        const invalidTypes = [
          'income',
          'expense',
          'Income',
          'Expense',
          'INCOME_TYPE',
        ];

        invalidTypes.forEach(type => {
          const invalidData = {
            ...validTransactionData,
            type: type as unknown,
          };

          expect(() => createTransactionSchema.parse(invalidData)).toThrow(
            ZodError
          );
        });
      });
    });

    describe('Category ID Validation Errors', () => {
      it('should reject empty category ID', () => {
        const invalidData = {
          ...validTransactionData,
          categoryId: '',
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should reject undefined category ID', () => {
        const invalidData = {
          ...validTransactionData,
          categoryId: undefined as unknown,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should reject null category ID', () => {
        const invalidData = {
          ...validTransactionData,
          categoryId: null as unknown,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should accept whitespace-only category ID (schema allows it)', () => {
        // Note: The actual schema validation allows whitespace-only strings
        const testData = {
          ...validTransactionData,
          categoryId: '   ',
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.categoryId).toBe('   ');
      });
    });

    describe('Description Validation Errors', () => {
      it('should reject description longer than 200 characters', () => {
        const tooLongDescription = 'A'.repeat(201);
        const invalidData = {
          ...validTransactionData,
          description: tooLongDescription,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should reject description much longer than limit', () => {
        const tooLongDescription = 'A'.repeat(500);
        const invalidData = {
          ...validTransactionData,
          description: tooLongDescription,
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });
    });

    describe('Complex Validation Scenarios', () => {
      it('should handle multiple validation errors', () => {
        const invalidData = {
          date: '',
          amount: -100,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: 'INVALID' as any,
          categoryId: '',
          description: 'A'.repeat(250),
        };

        expect(() => createTransactionSchema.parse(invalidData)).toThrow(
          ZodError
        );
      });

      it('should validate with minimal required fields', () => {
        const minimalData = {
          date: '2024-01-15',
          amount: 50,
          type: 'EXPENSE' as const,
          categoryId: 'cat-minimal',
        };

        const result = createTransactionSchema.parse(minimalData);

        expect(result.date).toBe('2024-01-15');
        expect(result.amount).toBe(50);
        expect(result.type).toBe('EXPENSE');
        expect(result.categoryId).toBe('cat-minimal');
        expect(result.description).toBeUndefined();
      });

      it('should validate with all fields provided', () => {
        const completeData = {
          date: '2024-01-15',
          amount: 150.75,
          type: 'INCOME' as const,
          categoryId: 'cat-complete',
          description: 'Complete transaction with all fields',
        };

        const result = createTransactionSchema.parse(completeData);

        expect(result).toEqual(completeData);
      });
    });

    describe('Type Safety', () => {
      it('should infer correct type from schema', () => {
        const testData: CreateTransactionFormValues = {
          date: '2024-01-15',
          amount: 100,
          type: 'EXPENSE',
          categoryId: 'cat-test',
          description: 'Type safety test',
        };

        const result = createTransactionSchema.parse(testData);

        // TypeScript should infer the correct types
        expect(typeof result.date).toBe('string');
        expect(typeof result.amount).toBe('number');
        expect(typeof result.type).toBe('string');
        expect(typeof result.categoryId).toBe('string');
        expect(typeof result.description).toBe('string');
      });

      it('should enforce enum values for type field', () => {
        const incomeTransaction = {
          ...validTransactionData,
          type: 'INCOME' as const,
        };

        const expenseTransaction = {
          ...validTransactionData,
          type: 'EXPENSE' as const,
        };

        expect(() =>
          createTransactionSchema.parse(incomeTransaction)
        ).not.toThrow();
        expect(() =>
          createTransactionSchema.parse(expenseTransaction)
        ).not.toThrow();
      });
    });

    describe('Error Messages', () => {
      it('should provide meaningful error message for missing date', () => {
        const invalidData = {
          ...validTransactionData,
          date: '',
        };

        try {
          createTransactionSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(
            zodError.errors.some(err => err.message.includes('Select date'))
          ).toBe(true);
        }
      });

      it('should provide meaningful error message for invalid amount', () => {
        const invalidData = {
          ...validTransactionData,
          amount: -50,
        };

        try {
          createTransactionSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(
            zodError.errors.some(err =>
              err.message.includes('Amount must be > 0')
            )
          ).toBe(true);
        }
      });

      it('should provide meaningful error message for missing category', () => {
        const invalidData = {
          ...validTransactionData,
          categoryId: '',
        };

        try {
          createTransactionSchema.parse(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(
            zodError.errors.some(err =>
              err.message.includes('Choose a category')
            )
          ).toBe(true);
        }
      });
    });

    describe('Schema Coercion', () => {
      it('should coerce string numbers to actual numbers', () => {
        const testData = {
          ...validTransactionData,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          amount: '125.50' as any,
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.amount).toBe(125.5);
        expect(typeof result.amount).toBe('number');
      });

      it('should coerce integer strings to numbers', () => {
        const testData = {
          ...validTransactionData,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          amount: '100' as any,
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.amount).toBe(100);
        expect(typeof result.amount).toBe('number');
      });

      it('should trim whitespace from description', () => {
        const testData = {
          ...validTransactionData,
          description: '  Trimmed description  ',
        };

        const result = createTransactionSchema.parse(testData);
        expect(result.description).toBe('Trimmed description');
      });
    });
  });
});
