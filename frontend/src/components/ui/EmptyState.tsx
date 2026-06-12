import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  title?: string;
  subtitle?: string;
}

export function EmptyState({
  icon = 'inbox',
  title = 'Nada por aqui',
  subtitle = 'Nenhum dado encontrado',
}: EmptyStateProps) {
  return (
    <View className="py-10 items-center">
      <MaterialIcons name={icon} size={48} color={Colors.onSurfaceVariant} />
      <Text className="text-on-surface text-body-lg font-semibold mt-4">{title}</Text>
      <Text className="text-on-surface-variant text-body-md mt-1 text-center">{subtitle}</Text>
    </View>
  );
}
