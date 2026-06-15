// src/services/investment.service.ts
import { api } from './api';
import { ApiResponse } from '../types/api';
import {
  Investment,
  InvestmentRequest,
  InvestmentDashboard,
  Institution,
  InstitutionRequest,
} from '../types/investment';

export const investmentService = {
  getInvestments: async (): Promise<Investment[]> => {
    const response = await api.get<ApiResponse<Investment[]>>('/api/v1/investments');
    return response.data.data;
  },

  getInvestmentById: async (id: string): Promise<Investment> => {
    const response = await api.get<ApiResponse<Investment>>(`/api/v1/investments/${id}`);
    return response.data.data;
  },

  createInvestment: async (request: InvestmentRequest): Promise<Investment> => {
    const response = await api.post<ApiResponse<Investment>>('/api/v1/investments', request);
    return response.data.data;
  },

  updateInvestment: async (id: string, request: InvestmentRequest): Promise<Investment> => {
    const response = await api.put<ApiResponse<Investment>>(`/api/v1/investments/${id}`, request);
    return response.data.data;
  },

  deleteInvestment: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/investments/${id}`);
  },

  getDashboardData: async (): Promise<InvestmentDashboard> => {
    const response = await api.get<ApiResponse<InvestmentDashboard>>('/api/v1/investments/dashboard');
    return response.data.data;
  },

  // Institutions (User approved Option A: new backend entity)
  getInstitutions: async (): Promise<Institution[]> => {
    const response = await api.get<ApiResponse<Institution[]>>('/api/v1/institutions');
    return response.data.data;
  },

  createInstitution: async (request: InstitutionRequest): Promise<Institution> => {
    const response = await api.post<ApiResponse<Institution>>('/api/v1/institutions', request);
    return response.data.data;
  },

  deleteInstitution: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/institutions/${id}`);
  },
};
