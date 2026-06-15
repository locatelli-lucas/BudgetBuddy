import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { NotificationType } from '../types/notification';

interface NotificationItemProps {
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  sentAt: string;
  onPress?: () => void;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  BUDGET_ALERT: 'account-balance-wallet',
  UNUSUAL_SPENDING: 'trending-up',
  AI_RECOMMENDATION: 'auto-awesome',
  BILL_REMINDER: 'receipt-long',
  INVESTMENT_ALERT: 'show-chart',
};

export function NotificationItem({
  title,
  body,
  type,
  isRead,
  sentAt,
  onPress,
}: NotificationItemProps) {
  const time = new Date(sentAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      className={`rounded-xl p-4 border ${!isRead ? 'bg-surface border-primary/30' : 'bg-surface border-outline-variant/10'}`}
      onPress={onPress}
    >
      <View className="flex-row items-start gap-3">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${isRead ? 'bg-surface-container' : 'bg-primary/10'}`}
        >
          <MaterialIcons
            name={(TYPE_ICONS[type] || 'notifications') as any}
            size={20}
            color={isRead ? Colors.onSurfaceVariant : Colors.primary}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text
              className={`text-body-md flex-1 mr-2 ${isRead ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}
            >
              {title}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-label-xs text-on-surface-variant">{time}</Text>
              {!isRead && <View className="w-2 h-2 rounded-full bg-primary" />}
            </View>
          </View>
          <Text className="text-label-sm text-on-surface-variant mt-1">{body}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
