// src/types/transaction.ts
import { FinancialResource } from './financialResource';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'CASH' | 'TRANSFER';

export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  category: Category;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  financialResource?: FinancialResource;
  paymentMethod: PaymentMethod;
  date: string; // ISO date string YYYY-MM-DD
  isRecurring: boolean;
  recurrenceRule?: string;
  createdAt: string;
}

export interface TransactionRequest {
  categoryId: string;
  type: TransactionType;
  amount: number;
  description: string;
  notes?: string;
  financialResourceId?: string;
  paymentMethod: PaymentMethod;
  date: string;
  isRecurring: boolean;
  recurrenceRule?: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
}
