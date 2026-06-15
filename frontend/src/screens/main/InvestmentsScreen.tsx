import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { investmentService } from '../../services/investment.service';
import { Investment, InvestmentDashboard } from '../../types/investment';
import { LineChart } from 'react-native-gifted-charts';

export function InvestmentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<InvestmentDashboard | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [dashData, listData] = await Promise.all([
        investmentService.getDashboardData(),
        investmentService.getInvestments(),
      ]);
      setDashboard(dashData);
      setInvestments(listData);
    } catch (err) {
      console.error('Failed to load investments statistics', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatCurrency = (val: number) => {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Mock static growth visual matching design
  const chartData = [
    { value: 10, label: 'Jan' },
    { value: 15, label: 'Mar' },
    { value: 30, label: 'Mai' },
    { value: 45, label: 'Jul' },
    { value: 65, label: 'Set' },
    { value: 85, label: 'Nov' },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center px-5 h-16 bg-surface border-b border-outline-variant/30">
        <View className="flex-row items-center gap-3">
          <View>
            <Text className="text-primary text-headline-md font-bold">Investimentos</Text>
            <Text className="text-on-surface-variant text-label-sm">Acompanhe seu patrimônio</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full"
          onPress={() => navigation.navigate('RegisteredInstitutions')}
        >
          <MaterialIcons name="account-balance" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {/* Portfolio Summary Card */}
          <View className="bg-[#1E293B] rounded-xl p-5 border border-outline-variant/30 shadow-md mb-6">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-label-md text-on-surface-variant">Valor atual</Text>
                <Text className="text-numeric-display font-medium text-primary mt-1">
                  {formatCurrency(dashboard?.currentTotalValue || 0)}
                </Text>
              </View>
              <View className="bg-primary/10 px-3 py-1 rounded-full flex-row items-center gap-1">
                <MaterialIcons name="trending-up" size={16} color={Colors.primary} />
                <Text className="text-primary text-label-md font-bold">
                  +{dashboard?.returnPercent?.toFixed(1) || '0'}%
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between pt-4 border-t border-outline-variant/20">
              <View>
                <Text className="text-label-sm text-on-surface-variant">Total investido</Text>
                <Text className="text-body-lg font-semibold text-on-surface">
                  {formatCurrency(dashboard?.totalInvested || 0)}
                </Text>
              </View>
              <View>
                <Text className="text-label-sm text-on-surface-variant">Lucro bruto</Text>
                <Text className="text-body-lg font-semibold text-primary">
                  {formatCurrency(dashboard?.netProfitLoss || 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Chart Section */}
          <View className="mb-8">
            <Text className="text-headline-md font-bold text-on-surface mb-4">Evolução</Text>
            <View className="bg-[#1E293B] rounded-xl p-4 items-center">
              <LineChart
                data={chartData}
                width={270}
                height={120}
                thickness={3}
                color={Colors.primary}
                hideDataPoints
                hideYAxisText
                hideRules
                hideAxesAndRules
                xAxisLabelTextStyle={{ color: Colors.onSurfaceVariant, fontSize: 10 }}
              />
            </View>
          </View>

          {/* Assets list */}
          <View className="mb-4">
            <Text className="text-headline-md font-bold text-on-surface mb-4">Meus Ativos</Text>
            {investments.length === 0 ? (
              <View className="p-8 items-center bg-[#1E293B] rounded-xl">
                <Text className="text-on-surface-variant text-body-md">Nenhum ativo registrado</Text>
              </View>
            ) : (
              investments.map((inv) => {
                const profit = inv.returnPercent || 0;
                const profitColor = profit >= 0 ? 'text-primary' : 'text-error';
                return (
                  <TouchableOpacity
                    key={inv.id}
                    className="bg-[#1E293B] rounded-xl p-4 border border-outline-variant/10 flex-col gap-3 mb-3"
                    onPress={() => navigation.navigate('AddAsset', { investmentId: inv.id, asset: inv })}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                          <Text className="font-bold text-primary">{inv.ticker.substring(0, 2).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text className="font-label-md font-bold text-on-surface">{inv.ticker}</Text>
                          <Text className="font-label-sm text-on-surface-variant">{inv.name}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-label-md font-bold text-on-surface">
                          {formatCurrency(inv.currentPrice || inv.avgPrice)}
                        </Text>
                        <Text className={`font-label-sm ${profitColor}`}>
                          {profit >= 0 ? '+' : ''}{profit.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center text-label-sm pt-2 border-t border-outline-variant/10">
                      <Text className="text-on-surface-variant">{inv.quantity} Qtd.</Text>
                      <Text className="text-on-surface-variant">Média: {formatCurrency(inv.avgPrice)}</Text>
                      <Text className="text-on-surface font-medium">{formatCurrency(inv.currentValue || (inv.avgPrice * inv.quantity))}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* Floating Action Button */}
      <View className="absolute bottom-6 right-6 left-6 z-40">
        <TouchableOpacity 
          className="bg-primary-container h-14 rounded-2xl flex-row items-center justify-center shadow-lg gap-2"
          onPress={() => navigation.navigate('AddAsset')}
        >
          <MaterialIcons name="add" size={24} color={Colors.onPrimaryContainer} />
          <Text className="text-on-primary-container font-bold text-label-md">Adicionar ativo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
