import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Carregando...' }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-background justify-center items-center gap-4">
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text className="text-body-md text-on-surface-variant">{message}</Text>
    </View>
  );
}
