// src/services/transaction.service.ts
import { api } from './api';
import { ApiResponse, PageResponse } from '../types/api';
import {
  Transaction,
  TransactionRequest,
  TransactionFilter,
  TransactionSummary,
  Category,
} from '../types/transaction';

export const transactionService = {
  getTransactions: async (
    page = 0,
    size = 20,
    filters?: TransactionFilter
  ): Promise<PageResponse<Transaction>> => {
    const params = {
      page,
      size,
      ...filters,
    };
    const response = await api.get<ApiResponse<PageResponse<Transaction>>>('/api/v1/transactions', {
      params,
    });
    return response.data.data;
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await api.get<ApiResponse<Transaction>>(`/api/v1/transactions/${id}`);
    return response.data.data;
  },

  getRecentTransactions: async (limit = 5): Promise<Transaction[]> => {
    const response = await api.get<ApiResponse<Transaction[]>>('/api/v1/transactions/recent', {
      params: { limit },
    });
    return response.data.data;
  },

  createTransaction: async (request: TransactionRequest): Promise<Transaction> => {
    const response = await api.post<ApiResponse<Transaction>>('/api/v1/transactions', request);
    return response.data.data;
  },

  updateTransaction: async (id: string, request: TransactionRequest): Promise<Transaction> => {
    const response = await api.put<ApiResponse<Transaction>>(`/api/v1/transactions/${id}`, request);
    return response.data.data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/transactions/${id}`);
  },

  getSummary: async (month?: number, year?: number): Promise<TransactionSummary> => {
    const params = { month, year };
    const response = await api.get<ApiResponse<TransactionSummary>>('/api/v1/transactions/summary', {
      params,
    });
    return response.data.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/api/v1/categories');
    return response.data.data;
  },

  createCategory: async (category: Omit<Category, 'id' | 'isDefault'>): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/api/v1/categories', category);
    return response.data.data;
  },

  updateCategory: async (
    id: string,
    category: Omit<Category, 'id' | 'isDefault'>
  ): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/api/v1/categories/${id}`, category);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/categories/${id}`);
  },
};
