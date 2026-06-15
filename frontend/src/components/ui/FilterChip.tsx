import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`h-10 px-4 rounded-full items-center justify-center mr-2 ${
        active ? 'bg-primary-container' : 'bg-surface border border-outline-variant/10'
      }`}
    >
      <Text
        className={`font-label-md ${
          active ? 'text-on-primary-container font-semibold' : 'text-on-surface-variant'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
