import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, LayoutAnimation
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { financialResourceService } from '../../../services/financialResourceService';
import { CreditCardInvoice } from '../../../types/financialResource';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { formatCurrency } from '../../../utils/currency';
import { formatSmartDate } from '../../../utils/dates';

export function CreditCardInvoiceScreen({ route, navigation }: any) {
  const { resourceId } = route.params;
  const [invoice, setInvoice] = useState<CreditCardInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { showError } = useErrorToast();

  const loadInvoice = useCallback(async () => {
    try {
      const data = await financialResourceService.getInvoice(resourceId, selectedMonth, selectedYear);
      setInvoice(data);
    } catch (err) {
      showError(err, 'Falha ao carregar fatura');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resourceId, selectedMonth, selectedYear, showError]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoice();
  };

  const changeMonth = (offset: number) => {
    let nextMonth = selectedMonth + offset;
    let nextYear = selectedYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear--;
    }
    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    setLoading(true);
  };

  const getMonthName = (m: number) => {
    const dates = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return dates[m - 1];
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-outline-variant/10 bg-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View className="ml-2 flex-1">
          <Text className="text-headline-sm font-bold text-on-surface">Fatura: {invoice?.cardName}</Text>
          <Text className="text-label-md text-on-surface-variant">Detalhamento de gastos e parcelas</Text>
        </View>
      </View>

      {/* Month Selector */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-surface-variant/30">
        <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
          <MaterialIcons name="chevron-left" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-title-md font-bold text-on-surface">{getMonthName(selectedMonth)}</Text>
          <Text className="text-label-sm text-on-surface-variant">{selectedYear}</Text>
        </View>
        <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
          <MaterialIcons name="chevron-right" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Summary Card */}
        <View className="bg-[#1E293B] p-6 rounded-3xl mb-8 border border-outline-variant/20 shadow-md">
          <View className="flex-row justify-between items-start mb-4">
             <View>
               <Text className="text-label-md text-on-surface-variant font-medium">Total da Fatura</Text>
               <Text className="text-display-sm font-bold text-primary mt-1">
                 {formatCurrency(invoice?.totalAmount || 0)}
               </Text>
             </View>
             <View className={`px-3 py-1 rounded-full ${invoice?.isPaid ? 'bg-success/20' : 'bg-warning/20'}`}>
                <Text className={`text-[10px] font-bold ${invoice?.isPaid ? 'text-success' : 'text-warning'}`}>
                  {invoice?.isPaid ? 'PAGA' : 'EM ABERTO'}
                </Text>
             </View>
          </View>

          <View className="flex-row gap-6 pt-4 border-t border-outline-variant/10">
             <View>
                <Text className="text-label-sm text-on-surface-variant">Fechamento</Text>
                <Text className="text-body-md font-semibold text-on-surface">
                  {formatSmartDate(invoice?.closingDate || '')}
                </Text>
             </View>
             <View>
                <Text className="text-label-sm text-on-surface-variant">Vencimento</Text>
                <Text className="text-body-md font-semibold text-on-surface">
                  {formatSmartDate(invoice?.dueDate || '')}
                </Text>
             </View>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="mb-8">
           <Text className="text-title-md font-bold text-on-surface mb-4">Compras do Mês</Text>
           {invoice?.transactions.length === 0 ? (
             <View className="bg-surface-variant/50 p-6 rounded-2xl items-center border border-dashed border-outline-variant/30">
                <Text className="text-label-md text-on-surface-variant">Nenhuma compra direta este mês</Text>
             </View>
           ) : (
             <View className="bg-surface-variant rounded-2xl overflow-hidden border border-outline-variant/10">
                {invoice?.transactions.map((tx, idx) => (
                  <View key={tx.id} className={`p-4 flex-row justify-between items-center ${idx < invoice.transactions.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                    <View className="flex-1 mr-2">
                       <Text className="text-body-md font-semibold text-on-surface" numberOfLines={1}>{tx.description}</Text>
                       <Text className="text-[10px] text-on-surface-variant uppercase font-bold">{formatSmartDate(tx.date)}</Text>
                    </View>
                    <Text className="text-body-md font-bold text-on-surface">{formatCurrency(tx.amount)}</Text>
                  </View>
                ))}
             </View>
           )}
        </View>

        {/* Installments Section */}
        <View className="mb-8">
           <Text className="text-title-md font-bold text-on-surface mb-4">Parcelas</Text>
           {invoice?.installments.length === 0 ? (
             <View className="bg-surface-variant/50 p-6 rounded-2xl items-center border border-dashed border-outline-variant/30">
                <Text className="text-label-md text-on-surface-variant">Nenhuma parcela este mês</Text>
             </View>
           ) : (
             <View className="bg-surface-variant rounded-2xl overflow-hidden border border-outline-variant/10">
                {invoice?.installments.map((inst, idx) => (
                  <View key={idx} className={`p-4 flex-row justify-between items-center ${idx < invoice.installments.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                    <View className="flex-1 mr-2">
                       <Text className="text-body-md font-semibold text-on-surface" numberOfLines={1}>{inst.description}</Text>
                       <Text className="text-[10px] text-on-surface-variant uppercase font-bold">
                         Parcela {inst.currentInstallment}/{inst.totalInstallments} • Compra em {formatSmartDate(inst.purchaseDate)}
                       </Text>
                    </View>
                    <Text className="text-body-md font-bold text-primary">{formatCurrency(inst.amount)}</Text>
                  </View>
                ))}
             </View>
           )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
