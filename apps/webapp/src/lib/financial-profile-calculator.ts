/**
 * Financial Profile Calculator
 * Core logic for calculating financial metrics, stages, and categories
 */

import {
  FinancialProfile,
  FinancialProfileInput,
  FinancialStage,
  FinancialCategory,
  FinancialMetrics,
  ProfileCalculationResult,
  FINANCIAL_CONSTANTS
} from '@/types/financial-profile';

/**
 * Main function to calculate a complete financial profile
 */
export function calculateFinancialProfile(
  input: FinancialProfileInput
): ProfileCalculationResult {
  // Calculate key metrics
  const metrics = calculateFinancialMetrics(input);
  
  // Determine stage and category
  const stage = determineFinancialStage(input, metrics);
  const category = determineFinancialCategory(input, metrics);
  
  // Build complete profile
  const profile: FinancialProfile = {
    stage,
    category,
    income: input.income,
    expenses: input.expenses,
    investments: input.investments,
    netWorth: input.netWorth,
    age: input.age,
    debt: input.debt,
    metrics,
    lastUpdated: new Date().toISOString()
  };
  
  // Generate insights and recommendations
  const insights = generateInsights(profile);
  const recommendations = generateRecommendations(profile);
  
  return {
    profile,
    insights,
    recommendations
  };
}

/**
 * Calculate core financial metrics
 */
export function calculateFinancialMetrics(input: FinancialProfileInput): FinancialMetrics {
  const { income, expenses, netWorth } = input;
  
  // Calculate savings rate: (net income - annual expenses) / net income
  const annualSavings = income.net - expenses.annual;
  const savingsRate = income.net > 0 ? annualSavings / income.net : 0;
  
  // Calculate FI number: annual expenses × 25 (4% rule)
  const fiNumber = expenses.annual * FINANCIAL_CONSTANTS.FI_MULTIPLIER;
  
  // Calculate progress to FI: net worth / FI number
  const progressToFI = fiNumber > 0 ? netWorth / fiNumber : 0;
  
  // Calculate years to FI
  const yearsToFI = calculateYearsToFI(input, fiNumber);
  
  return {
    savingsRate: Math.max(0, savingsRate), // Ensure non-negative
    fiNumber,
    progressToFI: Math.max(0, progressToFI), // Ensure non-negative
    yearsToFI: Math.max(0, yearsToFI) // Ensure non-negative
  };
}

/**
 * Calculate years to reach Financial Independence
 * Uses compound interest formula with monthly contributions
 */
function calculateYearsToFI(input: FinancialProfileInput, fiNumber: number): number {
  const { income, expenses, netWorth } = input;
  const annualSavings = income.net - expenses.annual;
  
  // If already at FI or negative savings, return 0 or infinity
  if (netWorth >= fiNumber) return 0;
  if (annualSavings <= 0) return 999; // Cap at 999 years for practical purposes
  
  // Use compound interest formula
  // Assume 7% annual return (historical stock market average)
  const annualReturn = 0.07;
  const monthlyReturn = annualReturn / 12;
  const monthlySavings = annualSavings / 12;
  const currentValue = netWorth;
  const targetValue = fiNumber;
  
  // If no current savings, use simple formula
  if (currentValue <= 0) {
    // PMT annuity formula: FV = PMT * [((1 + r)^n - 1) / r]
    // Solve for n: n = ln(1 + (FV * r) / PMT) / ln(1 + r)
    const months = Math.log(1 + (targetValue * monthlyReturn) / monthlySavings) / Math.log(1 + monthlyReturn);
    return months / 12;
  }
  
  // With current value, use more complex formula
  // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
  // This requires iterative solution
  let months = 0;
  let value = currentValue;
  
  while (value < targetValue && months < 12000) { // Cap at 1000 years
    value = value * (1 + monthlyReturn) + monthlySavings;
    months++;
  }
  
  return months / 12;
}

/**
 * Determine financial stage based on emergency fund and FI progress
 */
export function determineFinancialStage(
  input: FinancialProfileInput,
  metrics: FinancialMetrics
): FinancialStage {
  const { expenses, netWorth, debt = 0 } = input;
  const { progressToFI } = metrics;
  const { STAGE_THRESHOLDS } = FINANCIAL_CONSTANTS;
  
  // Calculate months of expenses covered (emergency fund)
  const monthsOfExpenses = expenses.monthly > 0 ? netWorth / expenses.monthly : 0;
  
  // Survival: High debt relative to income, less than 1 month expenses
  if (debt > input.income.net * 0.5 || monthsOfExpenses < STAGE_THRESHOLDS.SURVIVAL_MAX_MONTHS) {
    return 'Survival';
  }
  
  // Legacy: Achieved FI (100%+ progress)
  if (progressToFI >= STAGE_THRESHOLDS.LEGACY_MIN_PROGRESS) {
    return 'Legacy';
  }
  
  // Freedom: Close to FI (75%+ progress)
  if (progressToFI >= STAGE_THRESHOLDS.FREEDOM_MIN_PROGRESS) {
    return 'Freedom';
  }
  
  // Growth: Building wealth, more than 6 months emergency fund
  if (monthsOfExpenses > STAGE_THRESHOLDS.STABILITY_MAX_MONTHS) {
    return 'Growth';
  }
  
  // Stability: Has emergency fund (1-6 months)
  return 'Stability';
}

/**
 * Determine financial category based on income, spending, and strategy
 */
export function determineFinancialCategory(
  input: FinancialProfileInput,
  metrics: FinancialMetrics
): FinancialCategory {
  const { income, expenses, age } = input;
  const { savingsRate, progressToFI } = metrics;
  const { CATEGORY_THRESHOLDS } = FINANCIAL_CONSTANTS;
  
  // Already achieved FI
  if (progressToFI >= 1.0) {
    if (expenses.annual >= CATEGORY_THRESHOLDS.FAT_FIRE_EXPENSES) {
      return 'FatFIRE';
    } else if (expenses.annual <= CATEGORY_THRESHOLDS.LEAN_FIRE_EXPENSES) {
      return 'LeanFIRE';
    } else {
      return 'FIRE';
    }
  }
  
  // High earner with high savings rate but not yet rich
  if (
    income.gross >= CATEGORY_THRESHOLDS.HIGH_INCOME_THRESHOLD &&
    savingsRate >= CATEGORY_THRESHOLDS.HIGH_SAVINGS_RATE &&
    progressToFI < 0.75
  ) {
    return 'HENRY';
  }
  
  // Pursuing FIRE strategies
  if (savingsRate >= CATEGORY_THRESHOLDS.HIGH_SAVINGS_RATE) {
    if (expenses.annual >= CATEGORY_THRESHOLDS.FAT_FIRE_EXPENSES) {
      return 'FatFIRE';
    } else if (expenses.annual <= CATEGORY_THRESHOLDS.LEAN_FIRE_EXPENSES) {
      return 'LeanFIRE';
    } else {
      return 'FIRE';
    }
  }
  
  // Coast FIRE: Enough saved to coast to traditional retirement
  if (age < 40 && progressToFI >= 0.25) {
    return 'CoastFIRE';
  }
  
  // Barista FIRE: Partial FI, some work needed
  if (progressToFI >= 0.5 && progressToFI < 1.0) {
    return 'BaristaFIRE';
  }
  
  // Default to standard retirement planning
  return 'Standard';
}

/**
 * Generate insights about the financial profile
 */
function generateInsights(profile: FinancialProfile): string[] {
  const insights: string[] = [];
  const { stage, metrics, age } = profile;
  
  // Stage insights
  switch (stage) {
    case 'Survival':
      insights.push('Focus on debt reduction and building an emergency fund.');
      break;
    case 'Stability':
      insights.push('Great job building your emergency fund! Time to start investing.');
      break;
    case 'Growth':
      insights.push('You\'re in the wealth-building phase. Stay consistent with investments.');
      break;
    case 'Freedom':
      insights.push('You\'re close to financial independence! Consider your post-FI plans.');
      break;
    case 'Legacy':
      insights.push('Congratulations on achieving FI! Consider tax-efficient giving strategies.');
      break;
  }
  
  // Savings rate insights
  if (metrics.savingsRate >= 0.5) {
    insights.push(`Excellent savings rate of ${(metrics.savingsRate * 100).toFixed(0)}%!`);
  } else if (metrics.savingsRate >= 0.2) {
    insights.push(`Good savings rate of ${(metrics.savingsRate * 100).toFixed(0)}%. Consider optimizing further.`);
  } else {
    insights.push(`Your ${(metrics.savingsRate * 100).toFixed(0)}% savings rate could be improved.`);
  }
  
  // Years to FI insight
  if (metrics.yearsToFI < 10) {
    insights.push(`You could reach FI in approximately ${Math.round(metrics.yearsToFI)} years!`);
  } else if (metrics.yearsToFI < 20) {
    insights.push(`You're on track to reach FI in about ${Math.round(metrics.yearsToFI)} years.`);
  }
  
  // Age-specific insights
  if (age < 30 && metrics.savingsRate > 0.3) {
    insights.push('Starting early gives you a huge compound interest advantage!');
  }
  
  return insights;
}

/**
 * Generate recommendations for improvement
 */
function generateRecommendations(profile: FinancialProfile): string[] {
  const recommendations: string[] = [];
  const { stage, metrics, income, expenses } = profile;
  
  // Stage-specific recommendations
  switch (stage) {
    case 'Survival':
      recommendations.push('Build a €1,000 starter emergency fund first');
      recommendations.push('List all debts and consider debt snowball/avalanche method');
      break;
    case 'Stability':
      recommendations.push('Start investing 10-15% of income in index funds');
      recommendations.push('Consider increasing income through skills development');
      break;
    case 'Growth':
      recommendations.push('Maximize tax-advantaged accounts (401k, IRA equivalents)');
      recommendations.push('Review and optimize expenses regularly');
      break;
  }
  
  // Savings rate recommendations
  if (metrics.savingsRate < 0.1) {
    recommendations.push('Track expenses for a month to identify savings opportunities');
  } else if (metrics.savingsRate < 0.2) {
    recommendations.push('Aim to save at least 20% of your income');
  }
  
  // Income recommendations
  if (income.gross < 50000) {
    recommendations.push('Consider side hustles or skill development for income growth');
  }
  
  // Expense optimization
  const monthlyIncome = income.net / 12;
  const expenseRatio = expenses.monthly / monthlyIncome;
  
  if (expenseRatio > 0.8) {
    recommendations.push('Review major expense categories: housing, transportation, food');
  }
  
  return recommendations;
}

/**
 * Validate financial profile input data
 */
export function validateFinancialInput(input: Partial<FinancialProfileInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Required fields
  if (!input.income?.gross || input.income.gross <= 0) {
    errors.push('Gross income must be greater than 0');
  }
  
  if (!input.income?.net || input.income.net <= 0) {
    errors.push('Net income must be greater than 0');
  }
  
  if (!input.expenses?.annual || input.expenses.annual < 0) {
    errors.push('Annual expenses must be 0 or greater');
  }
  
  if (!input.investments?.annual || input.investments.annual < 0) {
    errors.push('Annual investments must be 0 or greater');
  }
  
  if (input.netWorth === undefined || input.netWorth === null) {
    errors.push('Net worth is required');
  }
  
  if (!input.age || input.age < 18 || input.age > 100) {
    errors.push('Age must be between 18 and 100');
  }
  
  // Logical validations
  if (input.income && input.income.net > input.income.gross) {
    errors.push('Net income cannot be greater than gross income');
  }
  
  if (input.expenses && input.income && input.expenses.annual > input.income.net * 2) {
    errors.push('Annual expenses seem unusually high compared to income');
  }
  
  if (input.debt && input.debt < 0) {
    errors.push('Debt cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}