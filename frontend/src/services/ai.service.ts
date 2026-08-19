// src/services/ai.service.ts
import { api } from './api';
import { ApiResponse } from '../types/api';
import {
  AiInsight,
  ChatResponse,
  CategorizationRequest,
  CategorizationResponse,
} from '../types/ai';

export const aiService = {
  getInsights: async (): Promise<AiInsight[]> => {
    const response = await api.get<ApiResponse<AiInsight[]>>('/api/v1/ai/insights');
    return response.data.data;
  },

  refreshInsights: async (): Promise<AiInsight[]> => {
    const response = await api.post<ApiResponse<AiInsight[]>>('/api/v1/ai/insights/refresh');
    return response.data.data;
  },

  sendChatMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post<ApiResponse<ChatResponse>>('/api/v1/ai/chat', {
      message,
    });
    return response.data.data;
  },

  autoCategorize: async (request: CategorizationRequest): Promise<CategorizationResponse> => {
    const response = await api.post<ApiResponse<CategorizationResponse>>(
      '/api/v1/ai/categorize',
      request
    );
    return response.data.data;
  },
};
