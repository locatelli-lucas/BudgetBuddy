// src/services/investment.service.ts
import { api } from './api';
import { ApiResponse } from '../types/api';
import {
  Investment,
  InvestmentRequest,
  InvestmentDashboard,
  PortfolioPerformancePoint,
  AssetSearchResult,
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

  getPortfolioSummary: async (): Promise<InvestmentDashboard> => {
    const response = await api.get<ApiResponse<InvestmentDashboard>>('/api/v1/portfolio/summary');
    return response.data.data;
  },

  getPortfolioPerformance: async (period: string = '1M'): Promise<PortfolioPerformancePoint[]> => {
    const response = await api.get<ApiResponse<PortfolioPerformancePoint[]>>(
      '/api/v1/portfolio/performance',
      { params: { period } }
    );
    return response.data.data;
  },

  // Institutions (User approved Option A: new backend entity)
  getInstitutions: async (): Promise<Institution[]> => {
    const response = await api.get<ApiResponse<Institution[]>>('/api/v1/financial-institutions');
    return response.data.data;
  },

  createInstitution: async (request: InstitutionRequest): Promise<Institution> => {
    const response = await api.post<ApiResponse<Institution>>('/api/v1/financial-institutions', request);
    return response.data.data;
  },

  deleteInstitution: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/financial-institutions/${id}`);
  },

  // Market data
  searchMarketAssets: async (query: string): Promise<AssetSearchResult[]> => {
    const response = await api.get<ApiResponse<AssetSearchResult[]>>('/api/v1/market/search', {
      params: { q: query },
    });
    return response.data.data;
  },

  getMarketQuote: async (symbol: string): Promise<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    previousClose: number;
    currency: string;
  }> => {
    const response = await api.get<ApiResponse<any>>(`/api/v1/market/quote/${symbol}`);
    return response.data.data;
  },

  getAssetNews: async (symbol: string, name?: string, page: number = 1, size: number = 10): Promise<any[]> => {
    // If it's fixed income or has no ticker, search by name
    const query = symbol && !symbol.includes('RENDA_FIXA') ? symbol : name;
    const response = await api.get<ApiResponse<any[]>>(`/api/v1/news/asset/${query}`, {
      params: { page, size }
    });
    return response.data.data;
  },

  generateAiNewsSummary: async (symbol: string, name?: string): Promise<{ summary: string }> => {
    const query = symbol && !symbol.includes('RENDA_FIXA') ? symbol : name;
    const response = await api.get<ApiResponse<any>>(`/api/v1/news/asset/${query}/summary`);
    return response.data.data;
  },
};
