import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatCurrency } from '../utils/currency';

interface BudgetCardProps {
  categoryName: string;
  categoryIcon: string;
  spent: number;
  limit: number;
  percentage: number;
  isOverBudget: boolean;
  onPress?: () => void;
}

export function BudgetCard({
  categoryName,
  categoryIcon,
  spent,
  limit,
  percentage,
  isOverBudget,
  onPress,
}: BudgetCardProps) {
  const remaining = limit - spent;
  const progressColor = isOverBudget ? 'bg-error' : percentage > 90 ? 'bg-warning' : 'bg-[#4ade80]';
  const remainingColor = isOverBudget ? 'text-error' : 'text-on-surface-variant';

  return (
    <TouchableOpacity
      className="bg-surface rounded-xl p-4 mb-3 border border-outline-variant/10"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isOverBudget ? 'bg-error/10' : 'bg-primary/10'
            }`}
          >
            <MaterialIcons
              name={(categoryIcon || 'help-outline') as any}
              size={20}
              color={isOverBudget ? Colors.error : Colors.primary}
            />
          </View>
          <View>
            <Text className="text-label-md font-bold text-on-surface">{categoryName}</Text>
            {isOverBudget ? (
              <Text className="text-label-sm text-error font-medium">Acima do limite</Text>
            ) : (
              <Text className={`text-label-sm ${remainingColor}`}>
                {formatCurrency(remaining)} restantes
              </Text>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-label-md font-bold ${isOverBudget ? 'text-error' : 'text-on-surface'}`}>
            {formatCurrency(spent)}
          </Text>
          <Text className="text-label-sm text-on-surface-variant">
            de {formatCurrency(limit)}
          </Text>
        </View>
      </View>
      <View className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
        <View
          className={`h-full ${progressColor} rounded-full`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </View>
    </TouchableOpacity>
  );
}
