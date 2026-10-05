import { api } from './api';
import { ApiResponse } from '../types/api';
import { Goal, GoalRequest } from '../types/goal';

export const goalService = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get<ApiResponse<Goal[]>>('/api/v1/goals');
    return response.data.data;
  },

  createGoal: async (request: GoalRequest): Promise<Goal> => {
    const response = await api.post<ApiResponse<Goal>>('/api/v1/goals', request);
    return response.data.data;
  },

  updateGoal: async (id: string, request: GoalRequest): Promise<Goal> => {
    const response = await api.put<ApiResponse<Goal>>(`/api/v1/goals/${id}`, request);
    return response.data.data;
  },

  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/goals/${id}`);
  }
};
