// src/services/notification.service.ts
import { api } from './api';
import { ApiResponse } from '../types/api';
import { Notification, NotificationPreference } from '../types/notification';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>('/api/v1/notifications');
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

  registerFcmToken: async (token: string): Promise<void> => {
    await api.put('/api/v1/users/me/fcm-token', { token });
  },

  // Notification Preferences (User approved Option A: new backend entity & endpoint)
  getPreferences: async (): Promise<NotificationPreference> => {
    const response = await api.get<ApiResponse<NotificationPreference>>('/api/v1/users/me/notification-preferences');
    return response.data.data;
  },

  updatePreferences: async (preferences: NotificationPreference): Promise<NotificationPreference> => {
    const response = await api.put<ApiResponse<NotificationPreference>>(
      '/api/v1/users/me/notification-preferences',
      preferences
    );
    return response.data.data;
  },
};
