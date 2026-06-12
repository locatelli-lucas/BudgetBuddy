import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CategoryProgress } from '../../components/CategoryProgress';
import { budgetService } from '../../services/budget.service';
import { BudgetStatusResponse, ForecastResponse } from '../../types/budget';

export function BudgetScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [budgets, setBudgets] = useState<BudgetStatusResponse[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const loadBudgetData = useCallback(async () => {
    try {
      const [statusData, forecastData] = await Promise.all([
        budgetService.getBudgetStatus(month, year),
        budgetService.getForecast(month, year),
      ]);
      // Only show categories that have budgets (id is not null)
      setBudgets(statusData.filter((b) => b.id !== null));
      setForecast(forecastData);
    } catch (err) {
      console.error('Failed to load budget data', err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useFocusEffect(
    useCallback(() => {
      loadBudgetData();
    }, [loadBudgetData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgetData();
    setRefreshing(false);
  }, [loadBudgetData]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const formatMonthName = () => {
    return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const formatCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View 
        className="flex-row justify-between items-center px-5 h-20 bg-surface z-50"
        style={{ paddingTop: insets.top }}
      >
        <View>
          <Text className="text-headline-md font-bold text-on-surface">Orçamentos</Text>
          <Text className="text-label-sm text-on-surface-variant">Controle seus limites mensais</Text>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full"
          onPress={() => navigation.navigate('BudgetHistory')}
        >
          <MaterialIcons name="history" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {/* Monthly Selector */}
          <View className="flex-row items-center justify-between mb-8 bg-surface-variant/30 rounded-xl p-2">
            <TouchableOpacity className="p-2" onPress={handlePrevMonth}>
              <MaterialIcons name="chevron-left" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <Text className="text-label-md font-bold text-on-surface uppercase tracking-wider">
              {formatMonthName()}
            </Text>
            <TouchableOpacity className="p-2" onPress={handleNextMonth}>
              <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Forecast Card */}
          {forecast && (
            <View className="bg-surface/80 rounded-2xl p-5 flex-row items-start gap-4 border-l-4 border-primary shadow-sm mb-8">
              <MaterialIcons name="info" size={24} color={Colors.primary} style={{ marginTop: 4 }} />
              <Text className="flex-1 text-body-md text-on-surface leading-relaxed">
                {forecast.isTrendingToExceed ? (
                  <Text>
                    Atenção! No ritmo atual você projeta gastar{' '}
                    <Text className="font-bold text-error">{formatCurrency(forecast.projectedTotalSpent)}</Text>, excedendo o limite total.
                  </Text>
                ) : (
                  <Text>
                    No ritmo atual você terminará o mês com{' '}
                    <Text className="font-bold text-primary">
                      {formatCurrency(forecast.currentTotalLimit - forecast.projectedTotalSpent)}
                    </Text>{' '}
                    disponíveis.
                  </Text>
                )}
              </Text>
            </View>
          )}

          {/* Budget Cards Section */}
          <View className="flex-col gap-4">
            {budgets.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-on-surface-variant text-body-md">Nenhum orçamento configurado</Text>
              </View>
            ) : (
              budgets.map((b) => (
                <TouchableOpacity
                  key={b.categoryId}
                  onPress={() => navigation.navigate('BudgetOptions', { budgetId: b.id, categoryId: b.categoryId, categoryName: b.categoryName })}
                >
                  <CategoryProgress 
                    id={b.categoryId}
                    name={b.categoryName}
                    spent={b.spent}
                    limit={b.limit || 0}
                    icon={(b.categoryIcon || 'help-outline') as any}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Main Action FAB-like Button */}
      <View className="absolute bottom-6 w-full px-5">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
          onPress={() => navigation.navigate('CreateBudget')}
        >
          <MaterialIcons name="add-circle" size={24} color={Colors.onPrimary} />
          <Text className="text-on-primary font-bold text-label-md">Criar orçamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
