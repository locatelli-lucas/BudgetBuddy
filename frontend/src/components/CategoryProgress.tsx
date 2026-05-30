import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export interface CategoryProgressProps {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export function CategoryProgress({ name, spent, limit, icon }: CategoryProgressProps) {
  const percentage = Math.min(100, Math.max(0, (spent / limit) * 100));
  const isOverBudget = spent > limit;
  const remaining = limit - spent;
  
  let progressColor = 'bg-[#4ade80]'; // emerald-500
  let iconBgColor = 'bg-primary-container/20';
  let iconColor = Colors.primary;
  
  if (isOverBudget) {
    progressColor = 'bg-error';
    iconBgColor = 'bg-error-container/20';
    iconColor = Colors.error;
  } else if (percentage > 90) {
    progressColor = 'bg-warning'; // Fallback to a warning color if close
    iconBgColor = 'bg-tertiary-container/20';
    iconColor = Colors.tertiary;
  }

  return (
    <View className="bg-surface-variant rounded-2xl p-5 border border-outline-variant/10">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <View className={`w-10 h-10 rounded-xl ${iconBgColor} flex items-center justify-center`}>
            <MaterialIcons name={icon} size={20} color={iconColor} />
          </View>
          <View>
            <Text className="text-label-md font-bold text-on-surface">{name}</Text>
            {isOverBudget ? (
              <Text className="text-label-sm text-error font-medium italic">Acima do limite</Text>
            ) : (
              <Text className="text-label-sm text-on-surface-variant">
                R$ {remaining.toFixed(2).replace('.', ',')} restantes
              </Text>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-label-md font-bold ${isOverBudget ? 'text-error' : 'text-on-surface'}`}>
            R$ {spent.toFixed(2).replace('.', ',')}
          </Text>
          <Text className="text-label-sm text-on-surface-variant">
            de R$ {limit.toFixed(2).replace('.', ',')}
          </Text>
        </View>
      </View>
      {/* Progress Bar */}
      <View className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <View className={`h-full ${progressColor} rounded-full`} style={{ width: `${percentage}%` }} />
      </View>
    </View>
  );
}
