// src/types/notification.ts

export type NotificationType = 'BUDGET_ALERT' | 'UNUSUAL_SPENDING' | 'AI_RECOMMENDATION' | 'BILL_REMINDER' | 'INVESTMENT_ALERT';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  sentAt: string;
}

export interface NotificationPreference {
  id?: string;
  budgetAlerts: boolean;
  unusualSpendingAlerts: boolean;
  aiInsights: boolean;
  billReminders: boolean;
  investmentAlerts: boolean;
}
