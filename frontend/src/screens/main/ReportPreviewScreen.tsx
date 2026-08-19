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
    const now = new Date();
    const month = targetMonth ?? (now.getMonth() + 1);
    const year = targetYear ?? now.getFullYear();

    reportService
      .getReportData(month, year)
      .then(setData)
      .catch(() => {
        // Use fallback mock data so the UI is visible even without backend
        setData({ ...getFallbackData(), month, year });
      })
      .finally(() => setLoading(false));
  }, [targetMonth, targetYear]);

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
      const month = targetMonth ?? (now.getMonth() + 1);
      const year = targetYear ?? now.getFullYear();

      const uri = await reportService.downloadPdf(month, year);
      await reportService.sharePdf(uri);
    } catch {
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
  const monthLabel = data ? `${monthNames[data.month - 1]} ${data.year}` : '';

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
          <Text className="text-[18px] leading-6 font-bold text-on-surface">Relatório mensal</Text>
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
                  Fluxo de Caixa Diário
                </Text>
                <Text className="text-[11px] text-on-surface-variant mt-2 italic">
                  Mostra o saldo líquido (Entradas - Saídas) em cada dia do mês.
                </Text>
              </View>

              <View className="bg-surface-container-low rounded-lg border border-surface-variant p-4">
                <View className="flex-row h-40">
                  {/* Y-Axis Labels */}
                  <View className="w-10 justify-between items-end pr-2 pb-6">
                    {(() => {
                      const daysInMonth = new Date(data.year, data.month, 0).getDate();
                      const dailyAmounts = new Array(daysInMonth).fill(0);
                      data.cashFlow.forEach(point => {
                        const day = new Date(point.date).getDate();
                        if (day >= 1 && day <= daysInMonth) dailyAmounts[day - 1] += point.amount;
                      });
                      const maxAbsAmount = Math.max(...dailyAmounts.map(Math.abs), 1);
                      return (
                        <>
                          <Text className="text-[8px] text-on-surface-variant font-bold">R$ {Math.round(maxAbsAmount / 1000)}k</Text>
                          <Text className="text-[8px] text-on-surface-variant/60">R$ {Math.round(maxAbsAmount / 2000)}k</Text>
                          <View className="h-[1px] w-full bg-outline-variant/20" />
                          <Text className="text-[9px] text-primary font-bold">0</Text>
                        </>
                      );
                    })()}
                  </View>

                  {/* Chart Area */}
                  <View className="flex-1">
                    <View className="flex-1 flex-row items-end gap-[1px] relative">
                      {/* Zero Line */}
                      <View className="absolute left-0 right-0 h-[1px] bg-outline-variant bottom-[10%] z-0" />

                      {(() => {
                        const daysInMonth = new Date(data.year, data.month, 0).getDate();
                        const dailyAmounts = new Array(daysInMonth).fill(0);

                        data.cashFlow.forEach(point => {
                          const day = new Date(point.date).getDate();
                          if (day >= 1 && day <= daysInMonth) {
                            dailyAmounts[day - 1] += point.amount;
                          }
                        });

                        const maxAbsAmount = Math.max(...dailyAmounts.map(Math.abs), 1);

                        return dailyAmounts.map((amount, i) => {
                          const heightPct = amount === 0 ? 5 : Math.max(10, (Math.abs(amount) / maxAbsAmount) * 85);
                          const isIncome = amount >= 0;
                          const opacity = amount === 0 ? '10' : 'E6';
                          const borderColor = isIncome ? Colors.primary : Colors.error;

                          return (
                            <View key={i} className="flex-1 items-center justify-end h-full">
                              <View
                                className="w-full rounded-t-[1px] border-x-[0.5px] border-t-[0.5px]"
                                style={{
                                  height: `${heightPct}%`,
                                  backgroundColor: amount === 0
                                    ? `${Colors.onSurfaceVariant}${opacity}`
                                    : (isIncome ? `${Colors.primary}${opacity}` : `${Colors.error}${opacity}`),
                                  borderColor: amount === 0 ? 'transparent' : borderColor,
                                }}
                              />
                            </View>
                          );
                        });
                      })()}
                    </View>

                    {/* X-Axis (Days) */}
                    <View className="flex-row justify-between mt-2 border-t border-outline-variant/20 pt-1">
                      <Text className="text-[9px] text-on-surface-variant font-medium">Dia 01</Text>
                      <Text className="text-[9px] text-on-surface-variant font-medium">Dia 15</Text>
                      <Text className="text-[9px] text-on-surface-variant font-medium">Dia {new Date(data.year, data.month, 0).getDate()}</Text>
                    </View>
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
