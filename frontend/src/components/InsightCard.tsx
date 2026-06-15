import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface InsightCardProps {
  type: string;
  title: string;
  body: string;
  icon?: string;
  severity: string;
  isRead: boolean;
  onPress?: () => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  INFO: Colors.primary,
  WARNING: Colors.warning,
  ERROR: Colors.error,
  SUCCESS: Colors.success,
};

export function InsightCard({
  type,
  title,
  body,
  icon,
  severity,
  isRead,
  onPress,
}: InsightCardProps) {
  const color = SEVERITY_COLORS[severity] || Colors.primary;

  return (
    <TouchableOpacity
      className="bg-surface rounded-xl p-4 mb-3 border border-outline-variant/10"
      onPress={onPress}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <MaterialIcons name={(icon || 'info') as any} size={20} color={color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20` }}>
              <Text className="text-label-xs font-bold" style={{ color }}>
                {type}
              </Text>
            </View>
            {!isRead && <View className="w-2 h-2 rounded-full bg-primary" />}
          </View>
          <Text className="text-body-md font-semibold text-on-surface">{title}</Text>
          <Text className="text-label-sm text-on-surface-variant mt-1" numberOfLines={2}>
            {body}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
