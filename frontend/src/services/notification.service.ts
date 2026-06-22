// src/services/notification.service.ts
import { api } from './api';
import { ApiResponse, PageResponse } from '../types/api';
import {
  Notification,
  NotificationPreference,
  NotificationCategory,
  PriceAlert,
  PriceAlertRequest
} from '../types/notification';

export const notificationService = {
  getNotifications: async (
    category?: NotificationCategory,
    unreadOnly?: boolean,
    page = 0,
    size = 20
  ): Promise<PageResponse<Notification>> => {
    const params = { category, unreadOnly, page, size };
    const response = await api.get<ApiResponse<PageResponse<Notification>>>('/api/v1/notifications', { params });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/api/v1/notifications/unread-count');
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/api/v1/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/api/v1/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/notifications/${id}`);
  },

  registerDeviceToken: async (token: string): Promise<void> => {
    await api.post('/api/v1/notifications/device-token', { token });
  },

  getPreferences: async (): Promise<NotificationPreference> => {
    const response = await api.get<ApiResponse<NotificationPreference>>('/api/v1/notifications/preferences');
    return response.data.data;
  },

  updatePreferences: async (preferences: NotificationPreference): Promise<NotificationPreference> => {
    const response = await api.put<ApiResponse<NotificationPreference>>(
      '/api/v1/notifications/preferences',
      preferences
    );
    return response.data.data;
  },

  getPriceAlerts: async (): Promise<PriceAlert[]> => {
    const response = await api.get<ApiResponse<PriceAlert[]>>('/api/v1/notifications/price-alerts');
    return response.data.data;
  },

  createPriceAlert: async (request: PriceAlertRequest): Promise<PriceAlert> => {
    const response = await api.post<ApiResponse<PriceAlert>>('/api/v1/notifications/price-alert', request);
    return response.data.data;
  },

  deletePriceAlert: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/notifications/price-alert/${id}`);
  },
};
