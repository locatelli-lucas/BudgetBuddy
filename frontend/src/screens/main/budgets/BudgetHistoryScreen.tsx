import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { budgetService } from '../../../services/budget.service';
import { BudgetStatusResponse } from '../../../types/budget';

export function BudgetHistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [months, setMonths] = useState<{ month: number; year: number; label: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<{ month: number; year: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budgets, setBudgets] = useState<BudgetStatusResponse[]>([]);

  // Generate last 6 months list
  useEffect(() => {
    const list = [];
    const date = new Date();
    for (let i = 0; i < 6; i++) {
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      list.push({ month: m, year: y, label });
      date.setMonth(date.getMonth() - 1);
    }
    setMonths(list);
    setSelectedMonth(list[0]);
  }, []);

  const loadHistory = useCallback(async () => {
    if (!selectedMonth) return;
    try {
      const data = await budgetService.getBudgetStatus(selectedMonth.month, selectedMonth.year);
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load history budget status', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalLimit = budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
  const totalSavings = totalLimit - totalSpent;
  const percentUsed = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const formatCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 h-14">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Histórico</Text>
        </View>
      </View>

      {/* Month selectors list */}
      <View className="h-14 my-2">
        <FlatList
          horizontal
          data={months}
          keyExtractor={(item) => `${item.month}-${item.year}`}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = selectedMonth?.month === item.month && selectedMonth?.year === item.year;
            return (
              <TouchableOpacity
                onPress={() => {
                  setLoading(true);
                  setSelectedMonth(item);
                }}
                className={`h-10 px-6 rounded-full items-center justify-center mr-2 ${
                  active ? 'bg-primary-container' : 'bg-surface-container'
                }`}
              >
                <Text className={`font-label-md uppercase ${active ? 'text-on-primary-container font-semibold' : 'text-on-surface-variant'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View className="flex-grow justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.categoryId}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListHeaderComponent={
            <View className="mb-6">
              {/* Total Summary Card */}
              <View className="bg-[#1E293B] rounded-2xl p-5 border border-outline-variant/10 shadow-md relative overflow-hidden mb-4">
                <View className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl" />
                <Text className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Gasto no Período</Text>
                <Text className="text-numeric-display font-medium text-on-surface mt-1">{formatCurrency(totalSpent)}</Text>
                
                <View className="flex-row items-center gap-2 mt-4">
                  <View className="h-2 flex-1 bg-surface-container rounded-full overflow-hidden">
                    <View className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, percentUsed)}%` }} />
                  </View>
                  <Text className="text-label-sm text-primary font-bold">{percentUsed}%</Text>
                </View>
                <Text className="text-label-sm text-on-surface-variant mt-2">Limite Total: {formatCurrency(totalLimit)}</Text>
              </View>

              {/* Bento info values */}
              <View className="flex-row gap-4 mb-4">
                <View className="flex-1 bg-[#1E293B] rounded-xl p-4 border border-outline-variant/10">
                  <MaterialIcons name="savings" size={20} color={Colors.tertiary} />
                  <Text className="text-label-sm text-on-surface-variant mt-2">Economizou</Text>
                  <Text className="text-headline-md font-bold text-tertiary mt-1">
                    {formatCurrency(totalSavings > 0 ? totalSavings : 0)}
                  </Text>
                </View>
                <View className="flex-1 bg-[#1E293B] rounded-xl p-4 border border-outline-variant/10">
                  <MaterialIcons name="trending-up" size={20} color={Colors.error} />
                  <Text className="text-label-sm text-on-surface-variant mt-2">Metas Atingidas</Text>
                  <Text className="text-headline-md font-bold text-on-surface mt-1">
                    {budgets.filter(b => b.spent <= b.limit).length}/{budgets.length}
                  </Text>
                </View>
              </View>

              <Text className="font-label-md text-label-md font-semibold text-on-surface uppercase tracking-widest pl-1 mb-3">
                Desempenho por Categoria
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const bUsed = item.limit > 0 ? Math.min(100, (item.spent / item.limit) * 100) : 0;
            const diff = (item.limit || 0) - item.spent;
            const exceeded = diff < 0;

            return (
              <View className="bg-[#1E293B] rounded-xl p-4 border border-outline-variant/10 mb-3">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                      <MaterialIcons name={(item.categoryIcon || 'help-outline') as any} size={20} color={exceeded ? Colors.error : Colors.primary} />
                    </View>
                    <View>
                      <Text className="font-label-md font-semibold text-on-surface">{item.categoryName}</Text>
                      <Text className={`font-label-sm text-label-sm ${exceeded ? 'text-error' : 'text-tertiary'}`}>
                        {exceeded ? `Excedeu ${formatCurrency(Math.abs(diff))}` : `Economizou ${formatCurrency(diff)}`}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`font-label-md font-bold ${exceeded ? 'text-error' : 'text-on-surface'}`}>
                      {formatCurrency(item.spent)}
                    </Text>
                    <Text className="font-label-sm text-on-surface-variant">de {formatCurrency(item.limit || 0)}</Text>
                  </View>
                </View>
                <View className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <View className={`h-full rounded-full ${exceeded ? 'bg-error' : 'bg-tertiary'}`} style={{ width: `${bUsed}%` }} />
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
