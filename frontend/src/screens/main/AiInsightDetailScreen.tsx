import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { aiService } from '../../services/ai.service';
import { AiInsight, InsightSeverity } from '../../types/ai';

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

export function AiInsightDetailScreen({ navigation, route }: any) {
  const insight: AiInsight = route.params?.insight;
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<AiInsight | null>(insight || null);

  // If only ID provided, fetch full insight
  useEffect(() => {
    if (!insight && route.params?.insightId) {
      setLoading(true);
      aiService
        .getInsights()
        .then((list) => {
          const found = list.find((i) => i.id === route.params.insightId);
          if (found) setDetail(found);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Mark as read
  useEffect(() => {
    if (detail && !detail.isRead) {
      // There's no single mark-read endpoint for insights in the current API,
      // but the insight list endpoint handles read status
    }
  }, [detail]);

  if (loading || !detail) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const severity = detail.severity;
  const color = SEVERITY_COLORS[severity] || Colors.primary;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Detalhes</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Card */}
        <View className="bg-surface rounded-xl p-5 border border-outline-variant/10 mb-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: `${color}20` }}
            >
              <MaterialIcons
                name={(detail.icon || SEVERITY_ICONS[severity] || 'info') as any}
                size={24}
                color={color}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Text className="text-label-xs font-bold" style={{ color }}>
                    {TYPE_LABELS[detail.type] || detail.type}
                  </Text>
                </View>
                <Text className="text-label-sm text-on-surface-variant">
                  {TYPE_LABELS[detail.type] || detail.type} · {severity}
                </Text>
              </View>
              <Text className="text-body-lg font-bold text-on-surface mt-1">{detail.title}</Text>
            </View>
          </View>

          <Text className="text-body-md text-on-surface-variant leading-relaxed">
            {detail.body}
          </Text>
        </View>

        {/* Created Date */}
        <Text className="text-label-sm text-on-surface-variant text-center">
          {new Date(detail.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
