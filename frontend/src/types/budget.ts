// src/types/budget.ts
import { Category } from './transaction';

export type BudgetStatus = 'OK' | 'WARNING' | 'EXCEEDED';

export interface Budget {
  id: string;
  category: Category;
  month: number;
  year: number;
  limitAmount: number;
}

export interface BudgetRequest {
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
}

export interface BudgetStatusResponse {
  id: string; // Budget ID (can be null/empty if no budget set yet)
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: BudgetStatus;
}

export interface ForecastResponse {
  currentTotalSpent: number;
  currentTotalLimit: number;
  projectedTotalSpent: number;
  averageDailySpend: number;
  safeDailySpend: number;
  isTrendingToExceed: boolean;
}
