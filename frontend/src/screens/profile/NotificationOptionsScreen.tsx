import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export function NotificationOptionsScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Opções de Notificação</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 pt-4 gap-2">
        <TouchableOpacity
          className="bg-surface rounded-xl p-4 flex-row items-center gap-4 border border-outline-variant/10"
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <MaterialIcons name="tune" size={22} color={Colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-body-md font-semibold text-on-surface">Preferências</Text>
            <Text className="text-label-sm text-on-surface-variant">Configure quais notificações deseja receber</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
