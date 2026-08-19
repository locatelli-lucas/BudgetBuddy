import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { notificationService } from '../../services/notification.service';
import { Notification, NotificationCategory } from '../../types/notification';
import { formatRelativeTime } from '../../utils/dates';
import { useErrorToast } from '../../contexts/ErrorToastContext';

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  FINANCE: 'account-balance-wallet',
  INVESTMENTS: 'show-chart',
  NEWS: 'article',
  AI: 'auto-awesome',
  SYSTEM: 'settings',
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  FINANCE: '#3b82f6', // Blue
  INVESTMENTS: '#10b981', // Green
  NEWS: '#f59e0b', // Amber
  AI: '#8b5cf6', // Violet
  SYSTEM: '#6b7280', // Gray
};

const TABS: { id: string; label: string; category?: NotificationCategory; unread?: boolean }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'unread', label: 'Não lidas', unread: true },
  { id: 'finance', label: 'Finanças', category: 'FINANCE' },
  { id: 'investments', label: 'Investimentos', category: 'INVESTMENTS' },
  { id: 'news', label: 'Notícias', category: 'NEWS' },
  { id: 'ai', label: 'IA', category: 'AI' },
  { id: 'system', label: 'Sistema', category: 'SYSTEM' },
];

export function NotificationsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const { showError } = useErrorToast();

  const currentTab = useMemo(() => TABS.find(t => t.id === activeTab), [activeTab]);

  const loadData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const [notifsPage, count] = await Promise.all([
        notificationService.getNotifications(currentTab?.category, currentTab?.unread),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifsPage.content);
      setUnreadCount(count);
    } catch (err) {
      showError(err, 'Falha ao carregar notificações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      showError(err, 'Falha ao marcar todas como lidas');
    }
  };

  const handlePress = async (item: Notification) => {
    if (selectionMode) {
      toggleSelection(item.id);
      return;
    }

    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setNotifications(prev =>
          prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }

    if (item.actionUrl) {
      // Logic to handle deep linking or navigation
      // navigation.navigate('RouteName', { params });
    }
  };

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    toggleSelection(id);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) setSelectionMode(false);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkRead = async () => {
    // In a real scenario, we'd have a bulk read API
    // For now, let's mark them one by one or just locally
    try {
      for (const id of selectedIds) {
        await notificationService.markAsRead(id);
      }
      setNotifications(prev =>
        prev.map(n => selectedIds.has(n.id) ? { ...n, isRead: true } : n)
      );
      cancelSelection();
      loadData(true);
    } catch {}
  };

  const handleBulkDelete = async () => {
    Alert.alert(
      'Excluir notificações',
      `Deseja excluir as ${selectedIds.size} notificações selecionadas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedIds) {
                await notificationService.deleteNotification(id);
              }
              setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
              cancelSelection();
              loadData(true);
            } catch {}
          }
        }
      ]
    );
  };

  const cancelSelection = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isSelected = selectedIds.has(item.id);
    const timeAgo = formatRelativeTime(item.createdAt);

    return (
      <TouchableOpacity
        className={`bg-surface rounded-xl p-4 mb-2 border ${
          isSelected ? 'border-primary' : !item.isRead ? 'border-primary/30' : 'border-outline-variant/10'
        }`}
        onPress={() => handlePress(item)}
        onLongPress={() => handleLongPress(item.id)}
      >
        <View className="flex-row items-start gap-3">
          {selectionMode ? (
            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
              {isSelected && <MaterialIcons name="check" size={16} color="white" />}
            </View>
          ) : (
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}20` }}
            >
              <MaterialIcons
                name={CATEGORY_ICONS[item.category] as any}
                size={20}
                color={CATEGORY_COLORS[item.category]}
              />
            </View>
          )}

          <View className="flex-1">
            <View className="flex-row justify-between items-start">
              <Text
                className={`text-body-md flex-1 mr-2 ${item.isRead ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}
              >
                {item.title}
              </Text>
              {!item.isRead && !selectionMode && (
                <View className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              )}
            </View>
            <Text className="text-label-sm text-on-surface-variant mt-1">{item.message}</Text>

            <View className="flex-row items-center justify-between mt-3">
              <View className="flex-row items-center gap-2">
                 <View
                   className="px-2 py-0.5 rounded-full"
                   style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}15` }}
                 >
                   <Text className="text-[10px] font-bold" style={{ color: CATEGORY_COLORS[item.category] }}>
                     {item.category}
                   </Text>
                 </View>
                 {item.priority === 'HIGH' || item.priority === 'CRITICAL' && (
                   <View className="bg-error/10 px-2 py-0.5 rounded-full">
                     <Text className="text-[10px] font-bold text-error">ALTA</Text>
                   </View>
                 )}
              </View>
              <Text className="text-[10px] text-on-surface-variant">{timeAgo}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View className="px-5 h-16 flex-row items-center justify-between border-b border-outline-variant/10">
        {selectionMode ? (
          <>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={cancelSelection} className="p-2 -ml-2">
                <MaterialIcons name="close" size={24} color={Colors.onSurface} />
              </TouchableOpacity>
              <Text className="text-headline-sm font-bold text-on-surface">{selectedIds.size} selecionados</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity onPress={handleBulkRead} className="p-2">
                <MaterialIcons name="mark-email-read" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkDelete} className="p-2">
                <MaterialIcons name="delete-outline" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
                <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <Text className="text-headline-md font-bold text-primary">Notificações {unreadCount > 0 ? `(${unreadCount})` : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')} className="p-2 -mr-2">
              <MaterialIcons name="settings" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tabs */}
      <View className="h-12">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 15, alignItems: 'center' }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item.id)}
              className={`px-4 py-1.5 rounded-full mr-2 ${activeTab === item.id ? 'bg-primary' : 'bg-surface-container'}`}
            >
              <Text className={`text-label-md font-medium ${activeTab === item.id ? 'text-white' : 'text-on-surface-variant'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* List Actions */}
      {!selectionMode && unreadCount > 0 && (
        <View className="px-5 py-2 flex-row justify-end">
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-label-md text-primary font-bold">Marcar todas como lidas</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View className="py-20 items-center">
              <MaterialIcons name="notifications-none" size={64} color={Colors.onSurfaceVariant} />
              <Text className="text-on-surface-variant text-body-lg mt-4 font-semibold">Nenhuma notificação</Text>
              <Text className="text-on-surface-variant text-label-md text-center px-10 mt-2">
                Você está em dia! Avisaremos quando algo importante acontecer.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
