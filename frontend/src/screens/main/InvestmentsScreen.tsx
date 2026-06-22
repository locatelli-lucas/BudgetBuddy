import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { investmentService } from '../../services/investment.service';
import { Investment, InvestmentDashboard, PortfolioPerformancePoint } from '../../types/investment';
import { LineChart } from 'react-native-gifted-charts';

const PERIODS = ['1M', '3M', '6M', '1Y', 'ALL'] as const;
const PERIOD_LABELS: Record<string, string> = {
  '1M': '1M', '3M': '3M', '6M': '6M', '1Y': '1A', 'ALL': 'Tudo',
};

function formatMoney(val: number): string {
  const abs = Math.abs(val);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = `${intPart},${parts[1]}`;
  return val < 0 ? `- R$ ${formatted}` : `R$ ${formatted}`;
}

function getAssetLogoUrl(ticker: string): string {
  if (!ticker) return '';
  const token = process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN;
  return `https://img.logo.dev/ticker/${ticker.toUpperCase()}?token=${token}&size=128`;
}

function AssetLogo({ ticker, size = 40 }: { ticker: string, size?: number }) {
  const [error, setError] = useState(false);
  const initials = ticker ? ticker.substring(0, 2).toUpperCase() : '??';

  if (error || !ticker) {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-lg bg-surface-container-highest flex items-center justify-center"
      >
        <Text className="font-bold text-primary">{initials}</Text>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size }} className="rounded-lg bg-white overflow-hidden flex items-center justify-center">
      <Image
        source={{ uri: getAssetLogoUrl(ticker) }}
        style={{ width: size * 0.8, height: size * 0.8 }}
        resizeMode="contain"
        onError={() => setError(true)}
      />
    </View>
  );
}

export function InvestmentsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<InvestmentDashboard | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [performance, setPerformance] = useState<PortfolioPerformancePoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1M');
  const [menuVisible, setMenuVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [dashData, listData, perfData] = await Promise.all([
        investmentService.getDashboardData(),
        investmentService.getInvestments(),
        investmentService.getPortfolioPerformance(selectedPeriod),
      ]);
      setDashboard(dashData);
      setInvestments(listData);
      setPerformance(perfData);
    } catch (err) {
      console.error('Failed to load investments statistics', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

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

  // Build chart data from real performance points
  const chartData = React.useMemo(() => {
    if (performance.length === 0) return [{ value: 0, label: '' }];

    const points = performance.map((p) => {
      const [, m, d] = p.date.split('-');
      return {
        value: p.value,
        label: `${d}/${m}`,
      };
    });

    // If only one point exists (e.g., first day), duplicate it to show a flat line
    if (points.length === 1) {
      return [
        { value: points[0].value, label: '' },
        { ...points[0] }
      ];
    }

    return points;
  }, [performance]);

  return (
    <View className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Top Header */}
      <View
        className="flex-row justify-between items-center px-5 bg-surface border-b border-outline-variant/10 z-50"
        style={{ paddingTop: insets.top + 8, paddingBottom: 16 }}
      >
        <View className="flex-row items-center gap-3">
          <View>
            <Text className="text-primary text-headline-md font-bold">Investimentos</Text>
            <Text className="text-on-surface-variant text-label-sm">Acompanhe seu patrimônio</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full"
          onPress={() => setMenuVisible(true)}
        >
          <MaterialIcons name="more-vert" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Overflow Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setMenuVisible(false)}>
          <View
            className="absolute right-0 mr-4 w-60 bg-surface-container rounded-xl border border-outline-variant/30 shadow-lg overflow-hidden"
            style={{ marginTop: insets.top + 45 }}
          >
            <TouchableOpacity
              className="flex-row items-center gap-3 px-4 py-3 border-b border-outline-variant/20"
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('AssetNews', { symbol: '', name: '' });
              }}
            >
              <MaterialIcons name="newspaper" size={20} color={Colors.onSurface} />
              <Text className="text-body-md text-on-surface">Notícias do Mercado</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center gap-3 px-4 py-3"
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('RegisteredInstitutions');
              }}
            >
              <MaterialIcons name="account-balance" size={20} color={Colors.onSurface} />
              <Text className="text-body-md text-on-surface">Minhas Corretoras</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

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
                  {formatMoney(dashboard?.currentTotalValue || 0)}
                </Text>
              </View>
              <View className="bg-primary/10 px-3 py-1 rounded-full flex-row items-center gap-1">
                <MaterialIcons
                  name={(dashboard?.returnPercent ?? 0) >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={(dashboard?.returnPercent ?? 0) >= 0 ? Colors.primary : Colors.error}
                />
                <Text
                  className={`text-label-md font-bold ${
                    (dashboard?.returnPercent ?? 0) >= 0 ? 'text-primary' : 'text-error'
                  }`}
                >
                  {(dashboard?.returnPercent ?? 0) >= 0 ? '+' : ''}
                  {dashboard?.returnPercent?.toFixed(1) || '0'}%
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between pt-4 border-t border-outline-variant/20">
              <View>
                <Text className="text-label-sm text-on-surface-variant">Total investido</Text>
                <Text className="text-body-lg font-semibold text-on-surface">
                  {formatMoney(dashboard?.totalInvested || 0)}
                </Text>
              </View>
              <View>
                <Text className="text-label-sm text-on-surface-variant">Lucro bruto</Text>
                <Text className={`text-body-lg font-semibold ${(dashboard?.netProfitLoss ?? 0) >= 0 ? 'text-primary' : 'text-error'}`}>
                  {formatMoney(dashboard?.netProfitLoss || 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Chart Section */}
          <View className="mb-8">
            <Text className="text-headline-md font-bold text-on-surface mb-2">Evolução</Text>

            {/* Period Selector */}
            <View className="flex-row gap-2 mb-4">
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  className={`px-3 py-1.5 rounded-full ${
                    selectedPeriod === p ? 'bg-primary-container' : 'bg-surface-container'
                  }`}
                  onPress={() => setSelectedPeriod(p)}
                >
                  <Text
                    className={`text-label-sm font-medium ${
                      selectedPeriod === p ? 'text-on-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    {PERIOD_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-[#1E293B] rounded-xl p-4 items-center">
              {performance.length === 0 ? (
                <View className="py-8 items-center">
                  <MaterialIcons name="show-chart" size={40} color={Colors.outline} />
                  <Text className="text-on-surface-variant text-body-md mt-2">
                    Sem dados para este período
                  </Text>
                  <Text className="text-on-surface-variant text-label-sm mt-1">
                    O histórico será gerado diariamente
                  </Text>
                </View>
              ) : (
                <LineChart
                  data={chartData}
                  width={280}
                  height={120}
                  thickness={3}
                  color={Colors.primary}
                  hideDataPoints
                  hideYAxisText
                  hideRules
                  hideAxesAndRules
                  initialSpacing={20}
                  endSpacing={20}
                  curved
                  xAxisLabelTextStyle={{ color: Colors.onSurfaceVariant, fontSize: 10 }}
                />
              )}
            </View>
          </View>

          {/* Assets list */}
          <View className="mb-4">
            <Text className="text-headline-md font-bold text-on-surface mb-4">Meus Ativos</Text>
            {investments.length === 0 ? (
              <View className="p-8 items-center bg-[#1E293B] rounded-xl">
                <MaterialIcons name="account-balance-wallet" size={48} color={Colors.outline} />
                <Text className="text-on-surface-variant text-body-md mt-3">Nenhum ativo registrado</Text>
                <Text className="text-on-surface-variant text-label-sm mt-1 text-center">
                  Adicione seu primeiro investimento para começar{'\n'}a acompanhar seu patrimônio
                </Text>
                <TouchableOpacity
                  className="mt-4 bg-primary-container px-6 py-3 rounded-xl"
                  onPress={() => navigation.navigate('AddAsset')}
                >
                  <Text className="text-on-primary-container font-bold">Adicionar ativo</Text>
                </TouchableOpacity>
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
                        <AssetLogo ticker={inv.ticker} size={40} />
                        <View>
                          <Text className="font-label-md font-bold text-on-surface">{inv.ticker}</Text>
                          <Text className="font-label-sm text-on-surface-variant">{inv.name}</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="font-label-md font-bold text-on-surface">
                          {formatMoney(inv.currentPrice || inv.avgPrice)}
                        </Text>
                        <Text className={`font-label-sm ${profitColor}`}>
                          {profit >= 0 ? '+' : ''}{profit.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center text-label-sm pt-2 border-t border-outline-variant/10">
                      <Text className="text-on-surface-variant">{inv.quantity} Qtd.</Text>
                      <Text className="text-on-surface-variant">Média: {formatMoney(inv.avgPrice)}</Text>
                      <Text className="text-on-surface font-medium">{formatMoney(inv.currentValue || (inv.avgPrice * inv.quantity))}</Text>
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
