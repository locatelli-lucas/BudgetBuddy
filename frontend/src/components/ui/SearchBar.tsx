import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  onClear,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface rounded-xl px-4 py-2 border border-outline-variant/10">
      <MaterialIcons name="search" size={20} color={Colors.outline} style={{ marginRight: 8 }} />
      <TextInput
        className="flex-1 text-body-md text-on-surface"
        placeholder={placeholder}
        placeholderTextColor={Colors.outline}
        value={value}
        onChangeText={onChangeText}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
        >
          <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      )}
    </View>
  );
}
