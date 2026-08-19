import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorToast } from '../../contexts/ErrorToastContext';

export function LeaveAccountScreen({ navigation }: any) {
  const { signOut } = useAuth();
  const { showError } = useErrorToast();
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await signOut();
      // Navigation happens automatically via AuthContext → RootNavigator
    } catch (err) {
      showError(err, 'Falha ao sair da conta.');
      setLeaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Sair</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 pt-12 items-center gap-6">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
          <MaterialIcons name="logout" size={40} color={Colors.primary} />
        </View>

        <Text className="text-headline-md font-bold text-on-surface text-center">
          Deseja sair da sua conta?
        </Text>

        <Text className="text-body-md text-on-surface-variant text-center">
          Você precisará fazer login novamente para acessar seus dados financeiros.
        </Text>
      </View>

      <View className="px-5 py-4 bg-surface border-t border-surface-container-highest gap-3">
        <TouchableOpacity
          className="w-full h-14 bg-primary-container rounded-xl items-center justify-center"
          onPress={handleLeave}
          disabled={leaving}
        >
          <Text className="text-on-primary-container font-bold text-label-md">
            {leaving ? 'Saindo...' : 'Sair da Conta'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full h-14 rounded-xl items-center justify-center border border-outline-variant"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-on-surface text-label-md">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
