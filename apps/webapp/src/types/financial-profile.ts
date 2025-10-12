/**
 * Financial Profile Types
 * Defines the structure for user financial profiles, stages, categories, and metrics
 */

// Financial stages based on the journey to Financial Independence
export type FinancialStage = 
  | 'Survival'    // Struggling to meet basic needs, high debt, no savings
  | 'Stability'   // Basic needs met, some emergency fund
  | 'Growth'      // Building wealth, investing regularly
  | 'Freedom'     // Close to or achieved FI, significant assets
  | 'Legacy';     // Beyond FI, focused on giving/legacy

// Financial categories based on income and strategy
export type FinancialCategory = 
  | 'HENRY'       // High Earner, Not Rich Yet
  | 'FIRE'        // Financial Independence, Retire Early
  | 'CoastFIRE'   // Enough saved to coast to traditional retirement
  | 'BaristaFIRE' // Partial FI with some work income needed
  | 'FatFIRE'     // FI with high spending/luxury lifestyle
  | 'LeanFIRE'    // FI with minimal spending
  | 'GeoFIRE'     // FI through geographic arbitrage
  | 'Standard';   // Traditional retirement planning

// Income structure
export interface Income {
  gross: number;    // Annual gross income
  net: number;      // Annual net income (after taxes)
}

// Expenses structure
export interface Expenses {
  annual: number;   // Annual expenses
  monthly: number;  // Monthly expenses (annual / 12)
}

// Investments structure
export interface Investments {
  annual: number;           // Total annual investment amount
  monthly?: number;         // Monthly recurring investments
  oneTime?: number;         // One-time investments this year
  bonus?: number;           // Bonus-based investments
}

// Key financial metrics
export interface FinancialMetrics {
  savingsRate: number;      // (net income - expenses) / net income
  fiNumber: number;         // Annual expenses × 25 (4% rule)
  progressToFI: number;     // Net worth / FI number (0-1+)
  yearsToFI: number;        // Estimated years to reach FI
}

// Complete financial profile structure
export interface FinancialProfile {
  // Classification
  stage: FinancialStage;
  category: FinancialCategory;
  
  // Financial data
  income: Income;
  expenses: Expenses;
  investments: Investments;
  netWorth: number;
  age: number;
  debt?: number;            // Optional debt amount
  
  // Calculated metrics
  metrics: FinancialMetrics;
  
  // Metadata
  lastUpdated: string;      // ISO timestamp
}

// Input data structure for profile calculation
export interface FinancialProfileInput {
  income: Income;
  expenses: Expenses;
  investments: Investments;
  netWorth: number;
  age: number;
  debt?: number;
}

// Profile calculation result
export interface ProfileCalculationResult {
  profile: FinancialProfile;
  insights: string[];       // Generated insights about the profile
  recommendations: string[]; // Recommendations for improvement
}

// Storage key for localStorage
export const FINANCIAL_PROFILE_STORAGE_KEY = 'fivt_financial_profile';

// Constants for calculations
export const FINANCIAL_CONSTANTS = {
  FI_MULTIPLIER: 25,        // Standard FIRE multiplier (4% rule)
  SAFE_WITHDRAWAL_RATE: 0.04, // 4% safe withdrawal rate
  
  // Stage thresholds (based on months of expenses covered)
  STAGE_THRESHOLDS: {
    SURVIVAL_MAX_MONTHS: 1,     // Less than 1 month expenses saved
    STABILITY_MAX_MONTHS: 6,    // 1-6 months emergency fund
    GROWTH_MAX_PROGRESS: 0.75,  // Less than 75% to FI
    FREEDOM_MIN_PROGRESS: 0.75, // 75%+ progress to FI
    LEGACY_MIN_PROGRESS: 1.0,   // Achieved FI (100%+)
  },
  
  // Category thresholds
  CATEGORY_THRESHOLDS: {
    HIGH_INCOME_THRESHOLD: 100000,  // €100k+ gross income for HENRY
    HIGH_SAVINGS_RATE: 0.5,         // 50%+ savings rate
    LEAN_FIRE_EXPENSES: 40000,      // €40k or less annual expenses
    FAT_FIRE_EXPENSES: 100000,      // €100k+ annual expenses
  }
} as const;