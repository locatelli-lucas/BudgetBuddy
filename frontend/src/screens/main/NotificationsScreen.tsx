import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { notificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../types/notification';

const TYPE_ICONS: Record<NotificationType, string> = {
  BUDGET_ALERT: 'account-balance-wallet',
  UNUSUAL_SPENDING: 'trending-up',
  AI_RECOMMENDATION: 'auto-awesome',
  BILL_REMINDER: 'receipt-long',
  INVESTMENT_ALERT: 'show-chart',
};

const TYPE_LABELS: Record<NotificationType, string> = {
  BUDGET_ALERT: 'Orçamento',
  UNUSUAL_SPENDING: 'Gasto Incomum',
  AI_RECOMMENDATION: 'IA',
  BILL_REMINDER: 'Conta',
  INVESTMENT_ALERT: 'Investimento',
};

export function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handlePress = async (item: Notification) => {
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const groupByDate = (items: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    items.forEach((n) => {
      const d = new Date(n.sentAt);
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });
    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Notificações</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-label-md text-primary">Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={groupByDate(notifications)}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View className="py-10 items-center">
              <MaterialIcons name="notifications-none" size={48} color={Colors.onSurfaceVariant} />
              <Text className="text-on-surface-variant text-body-md mt-4">Nenhuma notificação</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-4">
              <Text className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
                {item.date}
              </Text>
              {item.data.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  className={`bg-surface rounded-xl p-4 mb-2 border ${
                    !n.isRead ? 'border-primary/30' : 'border-outline-variant/10'
                  }`}
                  onPress={() => handlePress(n)}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        n.isRead ? 'bg-surface-container' : 'bg-primary/10'
                      }`}
                    >
                      <MaterialIcons
                        name={(TYPE_ICONS[n.type] || 'notifications') as any}
                        size={20}
                        color={n.isRead ? Colors.onSurfaceVariant : Colors.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start">
                        <Text
                          className={`text-body-md flex-1 mr-2 ${n.isRead ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}
                        >
                          {n.title}
                        </Text>
                        {!n.isRead && (
                          <View className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </View>
                      <Text className="text-label-sm text-on-surface-variant mt-1">{n.body}</Text>
                      <Text className="text-label-xs text-on-surface-variant mt-2">
                        {TYPE_LABELS[n.type] || n.type}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
