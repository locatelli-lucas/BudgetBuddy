import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Image, Linking
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';
import { Investment, PortfolioPerformancePoint } from '../../../types/investment';
import { LineChart } from 'react-native-gifted-charts';
import { formatCurrency } from '../../../utils/currency';
import { formatSmartDate } from '../../../utils/dates';
import { useErrorToast } from '../../../contexts/ErrorToastContext';

const PERIODS = ['1M', '3M', '6M', '1Y', 'ALL'] as const;
const PERIOD_LABELS: Record<string, string> = {
  '1M': '1M', '3M': '3M', '6M': '6M', '1Y': '1A', 'ALL': 'Tudo',
};

export function AssetDetailsScreen({ route, navigation }: any) {
  const { assetId } = route.params;
  const insets = useSafeAreaInsets();
  const { showError } = useErrorToast();

  const [asset, setAsset] = useState<Investment | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const loadData = useCallback(async () => {
    try {
      const assetData = await investmentService.getInvestmentById(assetId);
      setAsset(assetData);

      try {
        // Try to load history, but don't fail the whole screen if it fails
        const historyData = await investmentService.getPortfolioPerformance(selectedPeriod);
        setHistory(historyData);
      } catch (hErr) {
        console.warn('Failed to load performance history', hErr);
      }
    } catch (err) {
      showError(err, 'Falha ao carregar detalhes do ativo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [assetId, selectedPeriod, showError]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const periodStats = useMemo(() => {
    if (history.length < 2) return { diff: 0, percent: 0, isPositive: true };
    const startVal = history[0].value;
    const endVal = history[history.length - 1].value;
    const diff = endVal - startVal;
    const percent = startVal > 0 ? (diff / startVal) * 100 : 0;
    return { diff, percent, isPositive: diff >= 0 };
  }, [history]);

  const { yAxisOffset } = useMemo(() => {
    if (history.length === 0) return { minVal: 0, maxVal: 0, yAxisOffset: 0 };
    const vals = history.map((p) => p.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min;
    const padding = range === 0 ? (min > 0 ? min * 0.05 : 100) : range * 0.15;
    return {
      minVal: min,
      maxVal: max,
      yAxisOffset: Math.max(0, min - padding),
    };
  }, [history]);

  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    const count = history.length;
    const step = Math.max(1, Math.floor(count / 4));

    return history.map((p, idx) => {
      const parts = p.date ? p.date.split('-') : [];
      const dateStr = parts.length >= 3 ? `${parts[2]}/${parts[1]}` : p.date;
      const isFirst = idx === 0;
      const isLast = idx === count - 1;
      const isMid = idx % step === 0 && !isFirst && !isLast;
      const showLabel = isFirst || isLast || isMid;

      return {
        value: p.value,
        label: showLabel ? dateStr : '',
        labelTextStyle: { color: Colors.onSurfaceVariant, fontSize: 10 },
        date: dateStr,
        fullDate: p.date,
      };
    });
  }, [history]);

  const lineColor = periodStats.isPositive ? '#4ade80' : '#f87171';

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const profit = asset?.returnPercent || 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-sm font-bold text-on-surface">{asset?.ticker}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAsset', { investmentId: asset?.id, asset })}
          className="p-2 -mr-2"
        >
          <MaterialIcons name="edit" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View className="p-6">
          {/* Header Info */}
          <View className="flex-row items-center gap-4 mb-8">
             <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center border border-outline-variant/20 overflow-hidden">
                <Text className="text-primary font-bold text-xl">{asset?.ticker.substring(0, 2)}</Text>
             </View>
             <View className="flex-1">
                <Text className="text-headline-sm font-bold text-on-surface">{asset?.name}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                   <View className="bg-primary-container px-2 py-0.5 rounded-full">
                      <Text className="text-[10px] font-bold text-on-primary-container">{asset?.type}</Text>
                   </View>
                   <Text className="text-label-md text-on-surface-variant">
                     Posição desde {asset?.purchaseDate ? formatSmartDate(asset.purchaseDate) : ''}
                   </Text>
                </View>
             </View>
          </View>

          {/* Value Card */}
          <View className="bg-[#1E293B] p-6 rounded-3xl mb-8 border border-outline-variant/20 shadow-md">
             <View className="flex-row justify-between items-start mb-6">
                <View>
                   <Text className="text-label-md text-on-surface-variant font-medium">Valor Atual</Text>
                   <Text className="text-display-sm font-bold text-primary mt-1">
                     {formatCurrency(asset?.currentPrice || 0)}
                   </Text>
                </View>
                <View className={`bg-primary/10 px-3 py-1 rounded-full flex-row items-center gap-1`}>
                  <MaterialIcons name={profit >= 0 ? "trending-up" : "trending-down"} size={16} color={profit >= 0 ? Colors.primary : Colors.error} />
                  <Text className={`text-label-md font-bold ${profit >= 0 ? 'text-primary' : 'text-error'}`}>
                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}%
                  </Text>
                </View>
             </View>

             <View className="flex-row justify-between pt-6 border-t border-outline-variant/10">
                <View>
                   <Text className="text-label-sm text-on-surface-variant">Patrimônio</Text>
                   <Text className="text-body-lg font-bold text-on-surface">
                     {formatCurrency(asset?.currentValue || 0)}
                   </Text>
                </View>
                <View className="items-end">
                   <Text className="text-label-sm text-on-surface-variant">Custo Médio</Text>
                   <Text className="text-body-lg font-bold text-on-surface">
                     {formatCurrency(asset?.avgPrice || 0)}
                   </Text>
                </View>
             </View>
          </View>

          {/* Evolution Chart Section */}
          <View className="mb-8">
            <Text className="text-title-md font-bold text-on-surface mb-3">Evolução do Ativo</Text>

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

            <View className="bg-[#1E293B] rounded-2xl p-4 border border-outline-variant/10">
              {history.length > 0 && (
                <View className="flex-row justify-between items-center mb-3 px-1">
                  <View>
                    <Text className="text-label-sm text-on-surface-variant font-medium">
                      Variação no período ({PERIOD_LABELS[selectedPeriod]})
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <MaterialIcons
                        name={periodStats.isPositive ? 'trending-up' : 'trending-down'}
                        size={18}
                        color={lineColor}
                      />
                      <Text className="text-body-md font-bold" style={{ color: lineColor }}>
                        {formatCurrency(periodStats.diff)} ({periodStats.isPositive ? '+' : ''}
                        {periodStats.percent.toFixed(2)}%)
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {history.length === 0 ? (
                <View className="py-8 items-center">
                  <MaterialIcons name="show-chart" size={40} color={Colors.outline} />
                  <Text className="text-on-surface-variant text-body-md mt-2">
                    Sem dados de histórico para este ativo
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <LineChart
                    areaChart
                    data={chartData}
                    width={280}
                    height={120}
                    thickness={2.5}
                    color={lineColor}
                    startFillColor={lineColor}
                    endFillColor={lineColor}
                    startOpacity={0.25}
                    endOpacity={0.01}
                    hideDataPoints
                    hideYAxisText
                    hideRules
                    hideAxesAndRules
                    yAxisOffset={yAxisOffset}
                    initialSpacing={10}
                    endSpacing={10}
                    curved
                    xAxisLabelTextStyle={{ color: Colors.onSurfaceVariant, fontSize: 10 }}
                    pointerConfig={{
                      pointerStripHeight: 120,
                      pointerStripColor: 'rgba(255, 255, 255, 0.25)',
                      pointerStripWidth: 2,
                      pointerColor: lineColor,
                      radius: 5,
                      pointerLabelComponent: (items: any) => {
                        const item = items[0];
                        if (!item) return null;
                        return (
                          <View style={{
                            backgroundColor: '#0F172A',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.15)',
                            marginLeft: -35,
                            marginTop: -25,
                          }}>
                            <Text style={{ color: Colors.onSurfaceVariant, fontSize: 10, fontWeight: '600' }}>
                              {item.fullDate || item.date}
                            </Text>
                            <Text style={{ color: lineColor, fontSize: 11, fontWeight: '700' }}>
                              {formatCurrency(item.value)}
                            </Text>
                          </View>
                        );
                      },
                    }}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row gap-4 mb-8">
             <TouchableOpacity
               className="flex-1 bg-surface-variant p-4 rounded-2xl items-center border border-outline-variant/10"
               onPress={() => navigation.navigate('AssetNews', { symbol: asset?.ticker, name: asset?.name })}
             >
                <MaterialIcons name="newspaper" size={24} color={Colors.primary} />
                <Text className="text-label-md font-bold text-on-surface mt-2">NOTÍCIAS</Text>
             </TouchableOpacity>
             <TouchableOpacity
               className="flex-1 bg-surface-variant p-4 rounded-2xl items-center border border-outline-variant/10"
               onPress={() => navigation.navigate('AddAsset', { investmentId: asset?.id, asset })}
             >
                <MaterialIcons name="edit" size={24} color={Colors.primary} />
                <Text className="text-label-md font-bold text-on-surface mt-2">EDITAR</Text>
             </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View className="gap-4">
             <Text className="text-title-md font-bold text-on-surface">Dados da Posição</Text>
             <View className="flex-row gap-4">
                <StatBox label="Quantidade" value={asset?.quantity.toString() || '0'} icon="inventory-2" />
                <StatBox label="Investimento" value={formatCurrency((asset?.avgPrice || 0) * (asset?.quantity || 0))} icon="payments" />
             </View>
             <View className="flex-row gap-4">
                <StatBox label="Lucro/Prejuízo" value={formatCurrency((asset?.currentValue || 0) - ((asset?.avgPrice || 0) * (asset?.quantity || 0)))} icon="equalizer" isProfit />
                <StatBox label="Instituição" value={asset?.institutionId ? "Corretora" : "Não informada"} icon="account-balance" />
             </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, icon, isProfit }: any) {
  return (
    <View className="flex-1 bg-surface-variant p-4 rounded-2xl border border-outline-variant/10">
      <View className="flex-row items-center gap-2 mb-2">
         <MaterialIcons name={icon} size={16} color={Colors.onSurfaceVariant} />
         <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{label}</Text>
      </View>
      <Text className="text-body-md font-bold text-on-surface">{value}</Text>
    </View>
  );
}
