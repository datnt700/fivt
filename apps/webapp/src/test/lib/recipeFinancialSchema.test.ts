import { describe, it, expect } from 'vitest';
import { RecipeFinancialSchema, RecipeFinancialJsonSchema } from '@/lib/recipeFinancialSchema';

describe('RecipeFinancialSchema', () => {
  it('should validate a complete financial advice object', () => {
    const validData = {
      title: 'Investment Strategy',
      description: 'Long-term investment advice',
      strategies: [
        {
          name: 'Dollar Cost Averaging',
          detail: 'Invest fixed amount regularly'
        }
      ],
      steps: [
        {
          step: 1,
          action: 'Open investment account'
        },
        {
          step: 2,
          action: 'Set up automatic transfers'
        }
      ],
      content: 'Detailed investment guidance...',
      tips: ['Start early', 'Diversify portfolio']
    };

    const result = RecipeFinancialSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Investment Strategy');
      expect(result.data.strategies).toHaveLength(1);
      expect(result.data.steps).toHaveLength(2);
      expect(result.data.tips).toHaveLength(2);
    }
  });

  it('should validate minimal required data (title only)', () => {
    const minimalData = {
      title: 'Basic Financial Tip'
    };

    const result = RecipeFinancialSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Basic Financial Tip');
      expect(result.data.description).toBeUndefined();
      expect(result.data.strategies).toBeUndefined();
    }
  });

  it('should reject data without required title', () => {
    const invalidData = {
      description: 'Missing title'
    };

    const result = RecipeFinancialSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate strategies array structure', () => {
    const dataWithStrategies = {
      title: 'Financial Planning',
      strategies: [
        { name: 'Budgeting' },
        { name: 'Saving', detail: 'Emergency fund creation' }
      ]
    };

    const result = RecipeFinancialSchema.safeParse(dataWithStrategies);
    expect(result.success).toBe(true);
    if (result.success && result.data.strategies) {
      expect(result.data.strategies).toHaveLength(2);
      expect(result.data.strategies[0]?.name).toBe('Budgeting');
      expect(result.data.strategies[1]?.detail).toBe('Emergency fund creation');
    }
  });

  it('should validate steps array structure', () => {
    const dataWithSteps = {
      title: 'Debt Reduction Plan',
      steps: [
        { action: 'List all debts' },
        { step: 2, action: 'Prioritize by interest rate' }
      ]
    };

    const result = RecipeFinancialSchema.safeParse(dataWithSteps);
    expect(result.success).toBe(true);
    if (result.success && result.data.steps) {
      expect(result.data.steps).toHaveLength(2);
      expect(result.data.steps[0]?.action).toBe('List all debts');
      expect(result.data.steps[1]?.step).toBe(2);
    }
  });

  it('should reject invalid strategy structure', () => {
    const invalidData = {
      title: 'Valid Title',
      strategies: [
        { wrongField: 'Invalid structure' }
      ]
    };

    const result = RecipeFinancialSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid steps structure', () => {
    const invalidData = {
      title: 'Valid Title',
      steps: [
        { wrongField: 'Missing action field' }
      ]
    };

    const result = RecipeFinancialSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should export a valid JSON schema', () => {
    expect(RecipeFinancialJsonSchema).toBeDefined();
    expect(typeof RecipeFinancialJsonSchema).toBe('object');
    // Verify it's a valid JSON schema by checking it can be stringified
    expect(() => JSON.stringify(RecipeFinancialJsonSchema)).not.toThrow();
  });
});