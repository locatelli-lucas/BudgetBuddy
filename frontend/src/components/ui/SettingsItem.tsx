import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface SettingsItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subtitle?: string;
  rightText?: string;
  destructive?: boolean;
  onPress: () => void;
}

export function SettingsItem({
  icon,
  label,
  subtitle,
  rightText,
  destructive = false,
  onPress,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center p-4 border-b border-outline-variant/10"
      onPress={onPress}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={destructive ? Colors.error : Colors.primary}
        style={{ marginRight: 16 }}
      />
      <View className="flex-1">
        <Text className={`text-body-lg ${destructive ? 'text-error' : 'text-on-surface'}`}>
          {label}
        </Text>
        {subtitle && (
          <Text className="text-label-sm text-on-surface-variant mt-0.5">{subtitle}</Text>
        )}
      </View>
      {rightText && (
        <Text className="text-label-sm text-on-surface-variant mr-2">{rightText}</Text>
      )}
      <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}
