/**
 * Financial Profile Validation Schema
 * Zod schema for financial profile form validation
 */

import { z } from 'zod';

export const financialProfileSchema = z.object({
  // Income Section
  grossIncome: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return NaN;
        return parseFloat(val);
      }
      return val;
    })
    .refine((val) => !isNaN(val) && val > 0, 'Gross income must be a positive number'),
  
  netIncome: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return NaN;
        return parseFloat(val);
      }
      return val;
    })
    .refine((val) => !isNaN(val) && val > 0, 'Net income must be a positive number'),

  // Expenses Section
  monthlyExpenses: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return NaN;
        return parseFloat(val);
      }
      return val;
    })
    .refine((val) => !isNaN(val) && val >= 0, 'Monthly expenses must be 0 or greater'),

  // Investments Section
  monthlyInvestments: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return NaN;
        return parseFloat(val);
      }
      return val;
    })
    .refine((val) => !isNaN(val) && val >= 0, 'Monthly investments must be 0 or greater'),

  oneTimeInvestments: z
    .union([z.string(), z.number()])
    .optional()
    .default(0)
    .transform((val) => typeof val === 'string' ? parseFloat(val || '0') : val)
    .refine((val) => !isNaN(val) && val >= 0, 'One-time investments must be 0 or greater'),

  bonusInvestments: z
    .union([z.string(), z.number()])
    .optional()
    .default(0)
    .transform((val) => typeof val === 'string' ? parseFloat(val || '0') : val)
    .refine((val) => !isNaN(val) && val >= 0, 'Bonus investments must be 0 or greater'),

  // Assets & Personal Section
  netWorth: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return NaN;
        return parseFloat(val);
      }
      return val;
    })
    .refine((val) => !isNaN(val), 'Net worth must be a valid number'),

  age: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        if (val.trim() === '') return NaN;
        return parseInt(val);
      }
      return Math.round(val);
    })
    .refine((val) => !isNaN(val) && val >= 18 && val <= 100, 'Age must be between 18 and 100'),

  debt: z
    .union([z.string(), z.number()])
    .optional()
    .default(0)
    .transform((val) => typeof val === 'string' ? parseFloat(val || '0') : val)
    .refine((val) => !isNaN(val) && val >= 0, 'Debt must be 0 or greater'),

  // Additional Notes
  notes: z
    .string()
    .optional()
    .default('')
}).refine(
  (data) => data.netIncome <= data.grossIncome,
  {
    message: 'Net income cannot be greater than gross income',
    path: ['netIncome'],
  }
).refine(
  (data) => {
    const annualExpenses = data.monthlyExpenses * 12;
    return annualExpenses <= data.netIncome * 2; // Reasonable check
  },
  {
    message: 'Annual expenses seem unusually high compared to income',
    path: ['monthlyExpenses'],
  }
);

// Type for the form data (input) - before transformation
export type FinancialProfileFormData = {
  grossIncome: string | number;
  netIncome: string | number;
  monthlyExpenses: string | number;
  monthlyInvestments: string | number;
  oneTimeInvestments: string | number;
  bonusInvestments: string | number;
  netWorth: string | number;
  age: string | number;
  debt: string | number;
  notes: string;
};

// Type for the validated data (output) - after transformation
export type FinancialProfileValidatedData = z.infer<typeof financialProfileSchema>;

// Helper function to convert validated form data to API format
export function convertFormDataToProfileInput(data: FinancialProfileValidatedData) {
  return {
    income: {
      gross: data.grossIncome,
      net: data.netIncome
    },
    expenses: {
      annual: data.monthlyExpenses * 12,
      monthly: data.monthlyExpenses
    },
    investments: {
      annual: (data.monthlyInvestments * 12) + data.oneTimeInvestments + data.bonusInvestments,
      monthly: data.monthlyInvestments,
      oneTime: data.oneTimeInvestments,
      bonus: data.bonusInvestments
    },
    netWorth: data.netWorth,
    age: data.age,
    debt: data.debt
  };
}