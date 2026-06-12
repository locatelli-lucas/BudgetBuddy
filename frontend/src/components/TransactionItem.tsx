import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { formatCurrency } from '../utils/currency';

type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionItemProps {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: TransactionType;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
}

export function TransactionItem({ title, subtitle, amount, type, icon, onPress }: TransactionItemProps) {
  const isIncome = type === 'INCOME';
  const amountColor = isIncome ? 'text-[#4ade80]' : 'text-error';
  const amountPrefix = isIncome ? '+ ' : '- ';
  const formattedAmount = `${amountPrefix}${formatCurrency(Math.abs(amount))}`;
  
  const iconBgColor = isIncome ? 'bg-primary/20' : 'bg-surface-container-highest';
  const iconColor = isIncome ? Colors.primary : Colors.onSurfaceVariant;

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between p-3 rounded-lg"
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View className="flex-col">
          <Text className="text-body-md text-on-surface font-medium">{title}</Text>
          <Text className="text-label-sm text-on-surface-variant mt-0.5">{subtitle}</Text>
        </View>
      </View>
      <Text className={`text-body-md font-medium ${amountColor}`}>
        {formattedAmount}
      </Text>
    </TouchableOpacity>
  );
}
