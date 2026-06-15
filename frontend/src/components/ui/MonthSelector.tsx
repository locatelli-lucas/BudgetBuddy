import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface MonthSelectorProps {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function MonthSelector({ month, year, onPrev, onNext }: MonthSelectorProps) {
  return (
    <View className="flex-row items-center justify-between bg-surface rounded-xl p-3">
      <TouchableOpacity onPress={onPrev} className="p-2">
        <MaterialIcons name="chevron-left" size={24} color={Colors.onSurfaceVariant} />
      </TouchableOpacity>
      <Text className="text-label-md font-bold text-on-surface uppercase tracking-wider">
        {MONTHS[month - 1]} {year}
      </Text>
      <TouchableOpacity onPress={onNext} className="p-2">
        <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
}
