import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';

export function DeletedAccountScreen({ navigation }: any) {
  const { signOut } = useAuth();

  const handleDone = async () => {
    await signOut();
    // Auth state change will redirect to AuthNavigator automatically
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-5 pt-20 items-center gap-6">
        <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center">
          <MaterialIcons name="check-circle" size={48} color="#22C55E" />
        </View>

        <Text className="text-headline-lg font-bold text-on-surface text-center">
          Conta Excluída
        </Text>

        <Text className="text-body-md text-on-surface-variant text-center leading-relaxed">
          Sua conta e todos os dados associados foram removidos permanentemente.
          Agradecemos por ter utilizado o BudgetBuddy.
        </Text>
      </View>

      <View className="px-5 py-4">
        <TouchableOpacity
          className="w-full h-14 bg-primary rounded-xl items-center justify-center"
          onPress={handleDone}
        >
          <Text className="text-on-primary font-bold text-label-md">Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
