import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export function DeleteAccountScreen({ navigation }: any) {
  const handleContinue = () => {
    navigation.navigate('DeleteAccountConfirm');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Excluir Conta</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 pt-8 items-center gap-6">
        <View className="w-20 h-20 rounded-full bg-error/10 items-center justify-center">
          <MaterialIcons name="warning" size={40} color={Colors.error} />
        </View>

        <Text className="text-headline-md font-bold text-on-surface text-center">
          Tem certeza que deseja excluir sua conta?
        </Text>

        <Text className="text-body-md text-on-surface-variant text-center leading-relaxed">
          Esta ação é permanente e irreversível. Todos os seus dados financeiros, orçamentos,
          investimentos e histórico serão permanentemente apagados.
        </Text>

        <View className="bg-error/5 rounded-xl p-4 border border-error/20 w-full">
          <Text className="text-label-sm text-error font-semibold mb-2">O que será perdido:</Text>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="close" size={16} color={Colors.error} />
              <Text className="text-label-sm text-error">Todas as transações e histórico</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="close" size={16} color={Colors.error} />
              <Text className="text-label-sm text-error">Orçamentos e categorias personalizadas</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="close" size={16} color={Colors.error} />
              <Text className="text-label-sm text-error">Investimentos e corretoras</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="close" size={16} color={Colors.error} />
              <Text className="text-label-sm text-error">Relatórios e dados salvos</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
        <TouchableOpacity
          className="w-full h-14 bg-error rounded-xl items-center justify-center"
          onPress={handleContinue}
        >
          <Text className="text-on-error font-bold text-label-md">Continuar com Exclusão</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
