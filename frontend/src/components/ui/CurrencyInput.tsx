import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Colors } from '../../constants/colors';

interface CurrencyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  large?: boolean;
}

export function CurrencyInput({
  value,
  onChangeText,
  placeholder = '0,00',
  large = false,
}: CurrencyInputProps) {
  return (
    <View className="flex-row items-center justify-center">
      <Text
        className={`${large ? 'text-numeric-display' : 'text-headline-md'} text-on-surface-variant mr-2`}
      >
        R$
      </Text>
      <TextInput
        className={`${large ? 'text-numeric-display' : 'text-headline-md'} text-on-background text-center`}
        placeholder={placeholder}
        placeholderTextColor={Colors.outline}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
