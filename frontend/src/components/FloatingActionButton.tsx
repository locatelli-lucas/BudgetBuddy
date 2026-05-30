import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function FloatingActionButton({ onPress, icon = 'add' }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center z-50"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      }}
    >
      <MaterialIcons name={icon} size={28} color={Colors.onPrimary} />
    </TouchableOpacity>
  );
}
