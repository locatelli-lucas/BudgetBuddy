import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { aiService } from '../../services/ai.service';
import { AiInsight, InsightSeverity } from '../../types/ai';
import { useErrorToast } from '../../contexts/ErrorToastContext';

const SEVERITY_COLORS: Record<InsightSeverity, string> = {
  INFO: Colors.primary,
  WARNING: Colors.warning,
  ERROR: Colors.error,
  SUCCESS: Colors.success,
};

const SEVERITY_ICONS: Record<InsightSeverity, string> = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'check-circle',
};

const TYPE_LABELS: Record<string, string> = {
  ALERT: 'Alerta',
  RECOMMENDATION: 'Recomendação',
  PROGRESS: 'Progresso',
};

export function AiInsightsScreen({ navigation }: any) {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatReply, setChatReply] = useState<string | null>(null);
  const { showError } = useErrorToast();

  const loadInsights = useCallback(async () => {
    try {
      const data = await aiService.getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load AI insights', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await aiService.refreshInsights();
      setInsights(data);
    } catch {}
    setRefreshing(false);
  }, []);

  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    try {
      const res = await aiService.sendChatMessage(chatMessage.trim());
      setChatReply(res.reply);
      setChatMessage('');
    } catch (err) {
      showError(err, 'Falha ao enviar mensagem.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2">
            <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text className="text-primary text-headline-md font-bold">BudgetBuddy Insights</Text>
        </View>
        <TouchableOpacity
          className="p-2 rounded-full"
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="notifications" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          <Text className="text-on-surface text-headline-lg font-bold mb-2">Insights</Text>
          <Text className="text-on-surface-variant text-body-md mb-6">
            Recomendações baseadas no seu comportamento financeiro
          </Text>

          {/* Chat Reply */}
          {chatReply && (
            <View className="bg-surface rounded-xl p-4 border border-primary/20 mb-4">
              <View className="flex-row items-start gap-3">
                <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
                <Text className="text-body-md text-on-surface flex-1">{chatReply}</Text>
              </View>
              <TouchableOpacity className="mt-2 self-end" onPress={() => setChatReply(null)}>
                <Text className="text-label-sm text-primary">Fechar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Insight Cards */}
          {insights.length === 0 ? (
            <View className="py-10 items-center">
              <MaterialIcons name="auto-awesome" size={48} color={Colors.onSurfaceVariant} />
              <Text className="text-on-surface-variant text-body-md mt-4">Nenhum insight disponível</Text>
              <TouchableOpacity
                className="mt-4 bg-primary-container px-6 py-3 rounded-full"
                onPress={onRefresh}
              >
                <Text className="text-on-primary-container font-label-md">Gerar Insights</Text>
              </TouchableOpacity>
            </View>
          ) : (
            insights.map((insight) => {
              const color = SEVERITY_COLORS[insight.severity] || Colors.primary;
              return (
                <TouchableOpacity
                  key={insight.id}
                  className="bg-surface rounded-xl p-5 mb-4 border border-outline-variant/10"
                  onPress={() => navigation.navigate('AiInsightDetail', { insight })}
                >
                  <View className="flex-row items-start gap-4 mb-3">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <MaterialIcons
                        name={(insight.icon || SEVERITY_ICONS[insight.severity] || 'info') as any}
                        size={24}
                        color={color}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View
                          className="px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <Text className="text-label-xs font-bold" style={{ color }}>
                            {TYPE_LABELS[insight.type] || insight.type}
                          </Text>
                        </View>
                        {!insight.isRead && (
                          <View className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </View>
                      <Text className="text-on-surface text-body-lg font-bold">{insight.title}</Text>
                    </View>
                  </View>
                  <Text className="text-on-surface-variant text-body-md" numberOfLines={3}>
                    {insight.body}
                  </Text>
                  <View className="flex-row justify-end mt-3">
                    <Text className="text-label-sm text-primary">Ver detalhes →</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* AI Chat Input */}
      <View className="absolute bottom-5 left-5 right-5 z-40">
        <View className="bg-surface border border-outline-variant/30 rounded-full px-5 py-2 flex-row items-center gap-3 shadow-lg">
          <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
          <TextInput
            className="flex-1 text-on-surface font-body-md py-2"
            placeholder="Pergunte ao BudgetBuddy AI..."
            placeholderTextColor={Colors.outline}
            value={chatMessage}
            onChangeText={setChatMessage}
            onSubmitEditing={handleSendChat}
            returnKeyType="send"
          />
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
            onPress={handleSendChat}
            disabled={chatLoading}
          >
            {chatLoading ? (
              <ActivityIndicator size="small" color={Colors.onPrimary} />
            ) : (
              <MaterialIcons name="send" size={20} color={Colors.onPrimary} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
