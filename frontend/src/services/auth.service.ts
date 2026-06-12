// src/services/auth.service.ts
import { api } from './api';
import { ApiResponse } from '../types/api';
import { User, LoginResponse, TwoFactorSetupResponse } from '../types/auth';

export const authService = {
  login: async (email: string, password: string, twoFactorCode?: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', {
      email,
      password,
      twoFactorCode,
    });
    return response.data.data;
  },

  register: async (name: string, email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/api/v1/auth/register', {
      name,
      email,
      password,
    });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/api/v1/users/me');
    return response.data.data;
  },

  updateProfile: async (name: string, email?: string, avatarUrl?: string): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/api/v1/users/me', { name, email, avatarUrl });
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/api/v1/users/me/password', { currentPassword, newPassword });
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/api/v1/users/me', { data: { password } });
  },

  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response = await api.post<ApiResponse<TwoFactorSetupResponse>>('/api/v1/users/me/2fa/setup');
    return response.data.data;
  },

  enable2FA: async (code: string): Promise<void> => {
    await api.post('/api/v1/users/me/2fa/enable', { code });
  },

  disable2FA: async (code: string): Promise<void> => {
    await api.post('/api/v1/users/me/2fa/disable', { code });
  },
};
