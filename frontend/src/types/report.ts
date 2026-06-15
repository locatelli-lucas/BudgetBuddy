// src/types/report.ts

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

export interface CashFlowPoint {
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  userName: string;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  categories: CategoryBreakdown[];
  cashFlow: CashFlowPoint[];
  aiSummary?: string;
  recommendations?: string[];
}
