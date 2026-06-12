import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { reportService, type MonthlyReportData } from '../../services/report-service';

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}K`;
  }
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function formatCurrencyFull(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

interface Props {
  navigation: any;
  route: any;
}

export function ReportPreviewScreen({ navigation, route }: Props) {
  const pdfUri = route.params?.pdfUri;
  const [data, setData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    reportService
      .getReportData(now.getMonth() + 1, now.getFullYear())
      .then(setData)
      .catch(() => {
        // Use fallback mock data so the UI is visible even without backend
        setData(getFallbackData());
      })
      .finally(() => setLoading(false));
  }, []);

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
      const uri = await reportService.downloadPdf(now.getMonth() + 1, now.getFullYear());
      await reportService.sharePdf(uri);
    } catch {
      Alert.alert('Erro', 'Falha ao exportar PDF.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthLabel = data ? `${monthNames[data.month - 1]} ${data.year}` : '';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
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
                value={formatCurrency(data.totalIncome)}
              />
              <SummaryCard
                icon="arrow-upward"
                iconColor={Colors.error}
                label="Despesas"
                value={formatCurrency(data.totalExpense)}
              />
              <SummaryCard
                icon="savings"
                iconColor={Colors.tertiary}
                label="Economias"
                value={formatCurrency(data.netSavings)}
              />
            </View>
          )}

          {/* Gastos por Categoria */}
          {data && data.categories.length > 0 && (
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
          {data && data.cashFlow.length > 0 && (
            <View className="gap-4">
              <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-2">
                Fluxo de Caixa
              </Text>
              <View className="h-24 bg-surface-container-low rounded-lg border border-surface-variant overflow-hidden flex-row items-end p-2 gap-1">
                {data.cashFlow.slice(0, 12).map((point, i) => {
                  const maxAmount = Math.max(...data.cashFlow.map(p => Math.abs(p.amount)), 1);
                  const heightPct = Math.max(5, (Math.abs(point.amount) / maxAmount) * 80);
                  return (
                    <View
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: point.amount >= 0 ? `${Colors.primary}40` : `${Colors.error}40`,
                      }}
                    />
                  );
                })}
                {/* Simulated trend line via dots */}
              </View>
            </View>
          )}

          {/* Insights de IA */}
          {data && data.aiSummary && (
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
                    {data.aiSummary}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recomendações */}
          {data && data.recommendations.length > 0 && (
            <View className="gap-3">
              <Text className="text-[13px] text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-2">
                Recomendações
              </Text>
              <View className="bg-surface-container-low rounded-lg p-4 border border-surface-variant gap-3">
                {data.recommendations.map((rec, i) => (
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
    aiSummary:
      'Os gastos com Alimentação subiram 12% em comparação a Abril. Considere rever assinaturas de delivery. Excelente taxa de poupança este mês (33% da renda líquida). Você está acima da sua meta de 20%.',
    recommendations: [
      'Com o excedente de caixa, recomendamos alocar R$ 2.000,00 no fundo de Renda Fixa para aproveitar a taxa SELIC atual antes da próxima reunião do Copom.',
      'Tente reduzir os gastos com delivery em 10% no próximo mês.',
    ],
  };
}
