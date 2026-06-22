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

export interface NewsArticleAnalysis {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  articleContent: string;
  aiSummary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  opportunities: string[];
  risks: string[];
  marketImpact: string;
}

export interface AssetNewsOverview {
  overallSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  summary: string;
  mainTopics: string[];
  risks: string[];
  opportunities: string[];
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

  getArticleAnalysis: async (article: NewsArticle, symbol: string): Promise<NewsArticleAnalysis> => {
    const response = await api.get<ApiResponse<NewsArticleAnalysis>>('/api/v1/news/article/analysis', {
      params: {
        url: article.url,
        symbol,
        title: article.title,
        source: article.source,
        publishedAt: article.publishedAt
      },
    });
    return response.data.data;
  },

  getAssetOverview: async (symbol: string): Promise<AssetNewsOverview> => {
    const response = await api.post<ApiResponse<AssetNewsOverview>>(`/api/v1/news/asset/${symbol}/overview`);
    return response.data.data;
  },
};
