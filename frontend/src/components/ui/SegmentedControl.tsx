import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface SegmentedControlProps {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}

export function SegmentedControl({ options, selected, onSelect }: SegmentedControlProps) {
  return (
    <View className="flex-row bg-surface-container rounded-lg p-1">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          className={`flex-1 py-2 rounded-md ${
            selected === opt.key ? 'bg-primary-container' : ''
          }`}
          onPress={() => onSelect(opt.key)}
        >
          <Text
            className={`text-center font-label-md ${
              selected === opt.key ? 'text-on-primary-container' : 'text-on-surface-variant'
            }`}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
