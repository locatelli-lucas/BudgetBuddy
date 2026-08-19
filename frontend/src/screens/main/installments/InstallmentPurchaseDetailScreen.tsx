import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { installmentService } from '../../../services/installmentService';
import { InstallmentPurchase } from '../../../types/financialResource';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { formatCurrency } from '../../../utils/currency';
import { formatSmartDate } from '../../../utils/dates';

export function InstallmentPurchaseDetailScreen({ navigation, route }: any) {
  const { id } = route.params;
  const [purchase, setPurchase] = useState<InstallmentPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useErrorToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await installmentService.getById(id);
        setPurchase(data);
      } catch (err) {
        showError(err);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading || !purchase) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const paidInstallments = purchase.installments.filter(i => i.status === 'PAID').length;
  const progress = paidInstallments / purchase.installmentsCount;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-5 py-4 bg-surface border-b border-outline-variant/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-sm font-bold text-primary ml-2">Detalhes da Compra</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Header Info */}
        <View className="bg-surface-variant rounded-3xl p-6 mb-6">
          <Text className="text-label-md text-on-surface-variant">Descrição</Text>
          <Text className="text-headline-md font-bold text-on-surface mb-4">{purchase.description}</Text>

          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-label-sm text-on-surface-variant">Valor Total</Text>
              <Text className="text-title-lg font-bold text-primary">{formatCurrency(purchase.totalAmount)}</Text>
            </View>
            <View className="items-end">
              <Text className="text-label-sm text-on-surface-variant">Data da Compra</Text>
              <Text className="text-body-md text-on-surface">{formatSmartDate(purchase.purchaseDate)}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-label-sm text-on-surface-variant">Progresso</Text>
              <Text className="text-label-sm font-bold text-primary">{paidInstallments}/{purchase.installmentsCount} parcelas</Text>
            </View>
            <View className="h-2 w-full bg-outline-variant/30 rounded-full overflow-hidden">
               <View className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
            </View>
          </View>
        </View>

        {/* Installment List */}
        <Text className="text-title-md font-bold text-on-surface mb-4">Parcelas</Text>
        <View className="bg-surface-variant rounded-3xl overflow-hidden">
          {purchase.installments.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row items-center justify-between p-4 ${index < purchase.installments.length - 1 ? 'border-b border-outline-variant/10' : ''}`}
            >
              <View className="flex-row items-center gap-3">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${item.status === 'PAID' ? 'bg-success/20' : 'bg-surface-container'}`}>
                  <Text className={`font-bold ${item.status === 'PAID' ? 'text-success' : 'text-on-surface-variant'}`}>
                    {item.installmentNumber}
                  </Text>
                </View>
                <View>
                  <Text className="text-body-md font-bold text-on-surface">{formatCurrency(item.amount)}</Text>
                  <Text className="text-label-sm text-on-surface-variant">Vencimento: {formatSmartDate(item.dueDate)}</Text>
                </View>
              </View>

              <View className={`px-3 py-1 rounded-full ${item.status === 'PAID' ? 'bg-success/10' : 'bg-warning/10'}`}>
                <Text className={`text-label-sm font-bold ${item.status === 'PAID' ? 'text-success' : 'text-warning'}`}>
                  {item.status === 'PAID' ? 'Paga' : 'Pendente'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
