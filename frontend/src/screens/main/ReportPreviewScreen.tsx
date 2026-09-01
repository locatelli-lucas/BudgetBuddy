import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { reportService, type MonthlyReportData } from '../../services/report-service';

function formatCurrency(value: number): string {
  if (value === undefined || value === null) return 'R$ 0,00';
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}K`;
  }
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatCurrencyFull(value: number): string {
  if (value === undefined || value === null) return 'R$ 0,00';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

interface Props {
  navigation: any;
  route: any;
}

export function ReportPreviewScreen({ navigation, route }: Props) {
  const pdfUri = route.params?.pdfUri;
  const targetMonth = route.params?.month;
  const targetYear = route.params?.year;

  const [data, setData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startDate = route.params?.startDate;
    const endDate = route.params?.endDate;
    const month = startDate ? undefined : targetMonth;
    const year = startDate ? undefined : targetYear;

    reportService
      .getReportData(month, year, startDate, endDate)
      .then(setData)
      .catch(() => {
        // Use fallback mock data so the UI is visible even without backend
        const fallback = getFallbackData();
        if (startDate && endDate) {
          setData({
            ...fallback,
            startDate,
            endDate,
            month: undefined,
            year: undefined
          });
        } else {
          setData({ ...fallback, month: month || new Date().getMonth() + 1, year: year || new Date().getFullYear() });
        }
      })
      .finally(() => setLoading(false));
  }, [targetMonth, targetYear, route.params?.startDate, route.params?.endDate]);

  const handleShare = async () => {
    if (pdfUri) {
      try {
        await reportService.sharePdf(pdfUri);
      } catch {
        Alert.alert('Erro', 'Não foi possível compartilhar o PDF.');
      }
    }
  };

  const handleExportPdf = async () => {
    try {
      const now = new Date();

      const startDate = route.params?.startDate;
      const endDate = route.params?.endDate;

      const month = targetMonth ?? (now.getMonth() + 1);
      const year = targetYear ?? now.getFullYear();

      const uri = await reportService.downloadPdf(month, year, {
        includeCharts: true,
        includeAi: true,
        includeCategories: true,
        includeComparison: false,
        startDate,
        endDate
      });
      await reportService.sharePdf(uri);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao exportar PDF.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" style={{ flex: 1, backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  let monthLabel = '';
  if (data) {
    if (data.month && data.year) {
      monthLabel = `${monthNames[data.month - 1]} ${data.year}`;
    } else if (data.startDate && data.endDate) {
      const [sY, sM, sD] = data.startDate.split('-').map(Number);
      const [eY, eM, eD] = data.endDate.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);
      const format = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      monthLabel = `${format(start)} - ${format(end)}`;
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 h-16 bg-surface border-b border-outline-variant">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-[18px] leading-6 font-bold text-on-surface">
            {data?.startDate && data?.endDate && Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 35
              ? 'Relatório do período'
              : 'Relatório mensal'}
          </Text>
          <Text className="text-label-sm text-primary uppercase tracking-widest mt-0.5">{monthLabel}</Text>
        </View>
        <View className="w-10" />
      </View>

      {/* PDF Preview Card */}
      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ paddingBottom: 200 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-surface-container rounded-xl border border-outline-variant p-6 gap-8">
          {/* Header inside PDF */}
          <View className="flex-row justify-between items-end border-b border-outline-variant/50 pb-4">
            <View>
              <Text className="text-[20px] font-extrabold text-primary tracking-tight">BudgetBuddy</Text>
              <Text className="text-label-sm text-on-surface-variant mt-1">Resumo Executivo</Text>
            </View>
            <View className="items-right">
              <Text className="text-label-md text-on-surface">{monthLabel}</Text>
              <Text className="text-label-sm text-on-surface-variant mt-0.5">ID: R-492-X</Text>
            </View>
          </View>

          {/* Financial Summary Bento Grid */}
          {data && (
            <View className="flex-row gap-3">
              <SummaryCard
                icon="arrow-downward"
                iconColor={Colors.primary}
                label="Receitas"
                value={formatCurrency(data.summary?.totalIncome ?? data.totalIncome)}
              />
              <SummaryCard
                icon="arrow-upward"
                iconColor={Colors.error}
                label="Despesas"
                value={formatCurrency(data.summary?.totalExpense ?? data.totalExpense)}
              />
              <SummaryCard
                icon="savings"
                iconColor={Colors.tertiary}
                label="Economias"
                value={formatCurrency(data.summary?.netSavings ?? data.netSavings)}
              />
            </View>
          )}

          {/* Comparativo com Mês Anterior */}
          {data && data.comparison && (
            <View className="gap-4">
              <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-2">
                Comparativo com Mês Anterior
              </Text>
              <View className="flex-row gap-3">
                <VariationCard
                  label="Receita"
                  variation={data.comparison.incomeVariation}
                  isPositiveBetter={true}
                />
                <VariationCard
                  label="Despesas"
                  variation={data.comparison.expenseVariation}
                  isPositiveBetter={false}
                />
                <VariationCard
                  label="Economia"
                  variation={data.comparison.savingsRateVariation}
                  isPositiveBetter={true}
                  isPercentagePoints={true}
                />
              </View>
            </View>
          )}

          {/* Gastos por Categoria */}
          {data && data.categories?.length > 0 && (
            <View className="gap-4">
              <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-2">
                Gastos por Categoria
              </Text>
              {data.categories.map((cat, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <Text className="w-20 text-label-sm text-on-surface truncate">{cat.name}</Text>
                  <View className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: i === 0 ? Colors.primary : i === 1 ? Colors.tertiary : Colors.secondary,
                      }}
                    />
                  </View>
                  <Text className="w-12 text-right text-[11px] text-on-surface-variant">
                    {Math.round(cat.percentage)}%
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Fluxo de Caixa */}
          {data && data.cashFlow?.length > 0 && (
            <View className="gap-4">
              <View>
                <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-2">
                  {data.startDate && data.endDate && Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 35
                    ? 'Fluxo de Caixa Mensal'
                    : 'Fluxo de Caixa Diário'}
                </Text>
                <Text className="text-[11px] text-on-surface-variant mt-2 italic">
                  {data.startDate && data.endDate && Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) > 35
                    ? 'Mostra o saldo líquido (Entradas - Saídas) em cada mês do período.'
                    : 'Mostra o saldo líquido (Entradas - Saídas) em cada dia do período.'}
                </Text>
              </View>

              <View className="bg-surface-container-low rounded-lg border border-surface-variant p-4">
                <View className="flex-row h-40">
                  {/* Y-Axis Labels */}
                  <View style={{ width: 45, justifyContent: 'space-between', itemsAlign: 'flex-end', paddingRight: 8, paddingBottom: 24 }}>
                    {(() => {
                      const maxAbsAmount = data.cashFlow.length > 0
                        ? Math.max(...data.cashFlow.map(p => Math.abs(p.amount)), 1)
                        : 1000;
                      return (
                        <>
                          <Text style={{ fontSize: 9, color: Colors.onSurfaceVariant, fontWeight: '600', textAlign: 'right' }}>
                            {formatCurrency(maxAbsAmount)}
                          </Text>
                          <Text style={{ fontSize: 9, color: Colors.onSurfaceVariant, opacity: 0.7, textAlign: 'right' }}>
                            {formatCurrency(maxAbsAmount / 2)}
                          </Text>
                          <View style={{ height: 1, width: '100%', backgroundColor: Colors.outlineVariant, opacity: 0.2 }} />
                          <Text style={{ fontSize: 9, color: Colors.primary, fontWeight: '700', textAlign: 'right' }}>
                            R$ 0
                          </Text>
                        </>
                      );
                    })()}
                  </View>

                  {/* Chart Area */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 2, position: 'relative' }}>
                      {/* Zero Line */}
                      <View style={{ position: 'absolute', left: 0, right: 0, h: 1, backgroundColor: Colors.outlineVariant, bottom: '10%', zIndex: 0, opacity: 0.5 }} />

                      {(() => {
                        let dataPoints: { label: string, amount: number }[] = [];
                        let isMonthlyAggregation = false;

                        if (data.startDate && data.endDate) {
                          const [sY, sM, sD] = data.startDate.split('-').map(Number);
                          const [eY, eM, eD] = data.endDate.split('-').map(Number);
                          const start = new Date(sY, sM - 1, sD);
                          const end = new Date(eY, eM - 1, eD);
                          const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                          if (daysInPeriod > 35) {
                            isMonthlyAggregation = true;
                            // Aggregate by Month/Year
                            const monthlyMap = new Map<string, number>();
                            data.cashFlow.forEach(point => {
                              const [pY, pM] = point.date.split('-').map(Number);
                              const key = `${pY}-${pM}`;
                              monthlyMap.set(key, (monthlyMap.get(key) || 0) + point.amount);
                            });

                            // Create sorted list of months in range
                            let curr = new Date(sY, sM - 1, 1);
                            while (curr <= end) {
                              const key = `${curr.getFullYear()}-${curr.getMonth() + 1}`;
                              dataPoints.push({
                                label: monthNames[curr.getMonth()],
                                amount: monthlyMap.get(key) || 0
                              });
                              curr.setMonth(curr.getMonth() + 1);
                            }
                          } else {
                            // Daily aggregation for short periods
                            const dailyMap = new Map<string, number>();
                            data.cashFlow.forEach(point => dailyMap.set(point.date, (dailyMap.get(point.date) || 0) + point.amount));

                            let curr = new Date(start);
                            while (curr <= end) {
                              const dateStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
                              dataPoints.push({
                                label: String(curr.getDate()),
                                amount: dailyMap.get(dateStr) || 0
                              });
                              curr.setDate(curr.getDate() + 1);
                            }
                          }
                        } else if (data.month && data.year) {
                          // Standard Monthly Report (Daily bars)
                          const daysInMonth = new Date(data.year, data.month, 0).getDate();
                          const dailyMap = new Map<number, number>();
                          data.cashFlow.forEach(point => {
                            const day = new Date(point.date + 'T12:00:00').getDate();
                            dailyMap.set(day, (dailyMap.get(day) || 0) + point.amount);
                          });

                          for (let d = 1; d <= daysInMonth; d++) {
                            dataPoints.push({
                              label: String(d).padStart(2, '0'),
                              amount: dailyMap.get(d) || 0
                            });
                          }
                        }

                        if (dataPoints.length === 0) return null;
                        const maxAbsAmount = Math.max(...dataPoints.map(p => Math.abs(p.amount)), 1);

                        return dataPoints.map((point, i) => {
                          const heightPct = point.amount === 0 ? 2 : Math.max(5, (Math.abs(point.amount) / maxAbsAmount) * 85);
                          const isIncome = point.amount >= 0;

                          // For monthly reports, show 01, 15, and last day
                          const isSpecialDay = !isMonthlyAggregation && (
                            point.label === '01' ||
                            point.label === '15' ||
                            i === dataPoints.length - 1
                          );

                          return (
                            <View key={i} style={{
                              flex: 1,
                              minWidth: isMonthlyAggregation ? 20 : 4,
                              marginHorizontal: 1,
                              height: '100%',
                              justifyContent: 'flex-end',
                              alignItems: 'center'
                            }}>
                              <View
                                style={{
                                  width: '100%',
                                  height: `${heightPct}%`,
                                  backgroundColor: point.amount === 0
                                    ? Colors.outlineVariant
                                    : (isIncome ? Colors.primary : Colors.error),
                                  borderRadius: 2,
                                  opacity: point.amount === 0 ? 0.2 : 0.9,
                                }}
                              />
                              {(isMonthlyAggregation || isSpecialDay) && (
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    fontSize: 8,
                                    color: Colors.onSurfaceVariant,
                                    marginTop: 4,
                                    position: 'absolute',
                                    bottom: -16,
                                    width: 30,
                                    textAlign: 'center'
                                  }}
                                >
                                  {isMonthlyAggregation ? point.label.substring(0, 3) : point.label}
                                </Text>
                              )}
                            </View>
                          );
                        });
                      })()}
                    </View>

                    {/* X-Axis Labels (Removed spacer as labels are now absolute positioned) */}
                    <View style={{ marginTop: 16 }} />
                  </View>
                </View>
              </View>

              <View className="flex-row gap-4 justify-center">
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-primary" />
                  <Text className="text-[10px] text-on-surface-variant">Saldo Positivo</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <View className="w-2 h-2 rounded-full bg-error" />
                  <Text className="text-[10px] text-on-surface-variant">Saldo Negativo</Text>
                </View>
              </View>
            </View>
          )}

          {/* Insights de IA */}
          {(data?.aiAnalysis?.executiveSummary || data?.aiSummary) && (
            <View className="gap-3">
              <View className="flex-row items-center gap-2 border-b border-surface-variant pb-2">
                <MaterialIcons name="auto-awesome" size={16} color={Colors.primary} />
                <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest">
                  Insights de IA
                </Text>
              </View>
              <View className="bg-surface-container-low rounded-lg p-4 border border-surface-variant">
                <View className="flex-row items-start gap-3">
                  <MaterialIcons name="trending-up" size={18} color={Colors.tertiary} style={{ marginTop: 2 }} />
                  <Text className="text-[13px] leading-[18px] text-on-surface flex-1">
                    {data.aiAnalysis?.executiveSummary || data.aiSummary}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recomendações */}
          {((data?.aiAnalysis?.recommendations?.length ?? 0) > 0 || (data?.recommendations?.length ?? 0) > 0) && (
            <View className="gap-3">
              <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-2">
                Recomendações
              </Text>
              <View className="bg-surface-container-low rounded-lg p-4 border border-surface-variant gap-3">
                {(data.aiAnalysis?.recommendations || data.recommendations || []).map((rec, i) => (
                  <View key={i} className="flex-row items-start gap-3">
                    <MaterialIcons name="lightbulb" size={18} color={Colors.secondary} style={{ marginTop: 2 }} />
                    <Text className="text-[13px] leading-[18px] text-on-surface flex-1">{rec}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Footer */}
          <View className="pt-4 border-t border-outline-variant/30 items-center">
            <Text className="text-[10px] text-on-surface-variant">Gerado automaticamente por BudgetBuddy AI. Confidencial.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="bg-surface-container-highest/80 border-t border-outline-variant/50 px-5 pt-4 pb-6">
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="flex-1 h-12 bg-primary-container rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98]"
            onPress={handleExportPdf}
          >
            <MaterialIcons name="picture-as-pdf" size={18} color={Colors.onPrimaryContainer} />
            <Text className="text-label-md text-on-primaryContainer font-bold">Exportar PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 h-12 bg-secondary-container rounded-full flex-row items-center justify-center gap-2 active:scale-[0.98]"
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={18} color={Colors.onSecondaryContainer} />
            <Text className="text-label-md text-on-secondaryContainer">Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 bg-surface-container-low rounded-lg p-3 items-center border border-surface-variant">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${iconColor}1A` }}
      >
        <MaterialIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">{label}</Text>
      <Text className="text-[13px] text-on-surface font-bold">{value}</Text>
    </View>
  );
}

function VariationCard({
  label,
  variation,
  isPositiveBetter,
  isPercentagePoints = false,
}: {
  label: string;
  variation: number;
  isPositiveBetter: boolean;
  isPercentagePoints?: boolean;
}) {
  const isNeutral = variation === 0;
  const isGood = isPositiveBetter ? variation > 0 : variation < 0;

  let color = Colors.onSurfaceVariant;
  let icon = 'remove';

  if (!isNeutral) {
    color = isGood ? Colors.primary : Colors.error;
    icon = variation > 0 ? 'trending-up' : 'trending-down';
  }

  const sign = variation > 0 ? '+' : '';
  const unit = isPercentagePoints ? 'pp' : '%';
  const formattedVariation = `${sign}${variation.toFixed(1)}${unit}`;

  return (
    <View className="flex-1 bg-surface-container-low rounded-lg p-3 border border-surface-variant">
      <Text className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">{label}</Text>
      <View className="flex-row items-center gap-1">
        <MaterialIcons name={icon as any} size={14} color={color} />
        <Text className="text-[14px] font-bold" style={{ color }}>
          {formattedVariation}
        </Text>
      </View>
    </View>
  );
}

function getFallbackData(): MonthlyReportData {
  return {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    userName: 'Usuário',
    totalIncome: 12400,
    totalExpense: 8200,
    netSavings: 4200,
    savingsRate: 33.9,
    categories: [
      { name: 'Moradia', amount: 3690, percentage: 45 },
      { name: 'Alimentação', amount: 2050, percentage: 25 },
      { name: 'Transporte', amount: 1230, percentage: 15 },
      { name: 'Saúde', amount: 820, percentage: 10 },
      { name: 'Lazer', amount: 410, percentage: 5 },
    ],
    cashFlow: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-05-${String(i + 1).padStart(2, '0')}`,
      amount: Math.random() * 1000 - 200,
    })),
    comparison: {
      incomeVariation: 5.2,
      expenseVariation: -2.1,
      savingsRateVariation: 1.5,
    },
    aiSummary:
      'Os gastos com Alimentação subiram 12% em comparação a Abril. Considere rever assinaturas de delivery. Excelente taxa de poupança este mês (33% da renda líquida). Você está acima da sua meta de 20%.',
    recommendations: [
      'Com o excedente de caixa, recomendamos alocar R$ 2.000,00 no fundo de Renda Fixa para aproveitar a taxa SELIC atual antes da próxima reunião do Copom.',
      'Tente reduzir os gastos com delivery em 10% no próximo mês.',
    ],
  };
}
