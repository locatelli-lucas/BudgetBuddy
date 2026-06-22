// src/types/notification.ts

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';

export type NotificationCategory = 'FINANCE' | 'INVESTMENTS' | 'NEWS' | 'AI' | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: string;
}

export interface NotificationPreference {
  id?: string;
  pushEnabled: boolean;
  financeEnabled: boolean;
  investmentEnabled: boolean;
  newsEnabled: boolean;
  aiEnabled: boolean;
  systemEnabled: boolean;
  priceAlertEnabled: boolean;
  dividendAlertEnabled: boolean;
  dailySummaryEnabled: boolean;
  weeklySummaryEnabled: boolean;
  monthlySummaryEnabled: boolean;
}

export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface PriceAlertRequest {
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
}
