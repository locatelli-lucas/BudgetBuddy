// src/services/budget.service.ts
import { api } from './api';
import { ApiResponse } from '../types/api';
import { Budget, BudgetRequest, BudgetStatusResponse, ForecastResponse } from '../types/budget';

export const budgetService = {
  getBudgets: async (month?: number, year?: number): Promise<Budget[]> => {
    const params = { month, year };
    const response = await api.get<ApiResponse<Budget[]>>('/api/v1/budgets', { params });
    return response.data.data;
  },

  getBudgetStatus: async (month?: number, year?: number): Promise<BudgetStatusResponse[]> => {
    const params = { month, year };
    const response = await api.get<ApiResponse<BudgetStatusResponse[]>>('/api/v1/budgets/status', {
      params,
    });
    return response.data.data;
  },

  createBudget: async (request: BudgetRequest): Promise<Budget> => {
    const response = await api.post<ApiResponse<Budget>>('/api/v1/budgets', request);
    return response.data.data;
  },

  updateBudget: async (id: string, request: BudgetRequest): Promise<Budget> => {
    const response = await api.put<ApiResponse<Budget>>(`/api/v1/budgets/${id}`, request);
    return response.data.data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/budgets/${id}`);
  },

  getForecast: async (month?: number, year?: number): Promise<ForecastResponse> => {
    const params = { month, year };
    const response = await api.get<ApiResponse<ForecastResponse>>('/api/v1/budgets/forecast', {
      params,
    });
    return response.data.data;
  },
};
