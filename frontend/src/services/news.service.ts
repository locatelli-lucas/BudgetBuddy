import { api } from './api';
import { ApiResponse } from '../types/api';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  imageUrl: string;
}

export interface NewsAiSummary {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  keyDevelopments: string[];
  risks: string[];
  opportunities: string[];
  marketImpact: string;
}

export const newsService = {
  getAssetNews: async (symbol: string, page: number = 1, size: number = 10): Promise<NewsArticle[]> => {
    const response = await api.get<ApiResponse<NewsArticle[]>>(`/api/v1/news/asset/${symbol}`, {
      params: { page, size },
    });
    return response.data.data;
  },

  getAssetSummary: async (symbol: string): Promise<NewsAiSummary> => {
    const response = await api.post<ApiResponse<NewsAiSummary>>(`/api/v1/news/asset/${symbol}/summary`);
    return response.data.data;
  },
};
