import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface InvestmentAssetItemProps {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentValue: number;
  returnPercent: number;
  onPress?: () => void;
}

export function InvestmentAssetItem({
  ticker,
  name,
  quantity,
  avgPrice,
  currentValue,
  returnPercent,
  onPress,
}: InvestmentAssetItemProps) {
  const profitColor = returnPercent >= 0 ? 'text-primary' : 'text-error';

  const formatCurrency = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <TouchableOpacity
      className="bg-surface rounded-xl p-4 border border-outline-variant/10 flex-col gap-3 mb-3"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Text className="font-bold text-primary text-label-sm">
              {ticker.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text className="font-label-md font-bold text-on-surface">{ticker}</Text>
            <Text className="font-label-sm text-on-surface-variant">{name}</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-label-md font-bold text-on-surface">{formatCurrency(currentValue)}</Text>
          <Text className={`font-label-sm ${profitColor}`}>
            {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between pt-2 border-t border-outline-variant/10">
        <Text className="text-label-sm text-on-surface-variant">{quantity} Qtd.</Text>
        <Text className="text-label-sm text-on-surface-variant">
          Média: {formatCurrency(avgPrice)}
        </Text>
        <MaterialIcons name="chevron-right" size={16} color={Colors.onSurfaceVariant} />
      </View>
    </TouchableOpacity>
  );
}
