import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';

export function InvestmentOptionsScreen({ navigation, route }: any) {
  const params = route.params || {};
  const { investmentId, ticker, name } = params;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('Confirmação', `Remover "${ticker || name}" permanentemente?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await investmentService.deleteInvestment(investmentId);
            navigation.pop(2); // Go back past options and detail
          } catch (err) {
            Alert.alert('Erro', 'Falha ao remover investimento');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Opções</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 pt-4 gap-2">
        <TouchableOpacity
          className="bg-surface rounded-xl p-4 flex-row items-center gap-4 border border-outline-variant/10"
          onPress={() => navigation.navigate('AddAsset', { investmentId, asset: params })}
        >
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <MaterialIcons name="edit" size={22} color={Colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-body-md font-semibold text-on-surface">Editar</Text>
            <Text className="text-label-sm text-on-surface-variant">Alterar dados do ativo</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-surface rounded-xl p-4 flex-row items-center gap-4 border border-outline-variant/10"
          onPress={handleDelete}
          disabled={deleting}
        >
          <View className="w-10 h-10 rounded-full bg-error/10 items-center justify-center">
            {deleting ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <MaterialIcons name="delete" size={22} color={Colors.error} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-body-md font-semibold text-error">Remover</Text>
            <Text className="text-label-sm text-on-surface-variant">Excluir permanentemente</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
