import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Modal, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { reportService } from '../../services/report-service';

type PeriodKey = '7days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';

const periods: { key: PeriodKey; label: string }[] = [
  { key: '7days', label: 'Últimos 7 dias' },
  { key: 'thisMonth', label: 'Este mês' },
  { key: 'lastMonth', label: 'Mês anterior' },
  { key: 'thisYear', label: 'Este ano' },
  { key: 'lastYear', label: 'Ano passado' },
  { key: 'custom', label: 'Personalizado' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onGenerated: (pdfUri: string, month: number, year: number, startDate?: string, endDate?: string) => void;
  onCustomDate?: () => void;
  customRange?: { startDate: string; endDate: string };
  // Checkbox state lifted to parent to persist across navigation
  includeCharts: boolean;
  onIncludeChartsChange: (v: boolean) => void;
  includeAi: boolean;
  onIncludeAiChange: (v: boolean) => void;
  includeCategories: boolean;
  onIncludeCategoriesChange: (v: boolean) => void;
  includeComparison: boolean;
  onIncludeComparisonChange: (v: boolean) => void;
}

export function ExportReportSheet({
  visible, onClose, onGenerated, onCustomDate, customRange,
  includeCharts, onIncludeChartsChange,
  includeAi, onIncludeAiChange,
  includeCategories, onIncludeCategoriesChange,
  includeComparison, onIncludeComparisonChange,
}: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('thisMonth');
  const [loading, setLoading] = useState(false);

  // Sync selected period if customRange is provided
  React.useEffect(() => {
    if (customRange) {
      setSelectedPeriod('custom');
    }
  }, [customRange]);

  const getReportParams = (): { month?: number; year?: number; startDate?: string; endDate?: string } => {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (selectedPeriod) {
      case 'lastMonth': {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return { month: d.getMonth() + 1, year: d.getFullYear() };
      }
      case 'thisMonth':
        return { month: now.getMonth() + 1, year: now.getFullYear() };
      case '7days': {
        const start = new Date();
        start.setDate(now.getDate() - 7);
        return { startDate: formatDate(start), endDate: formatDate(now) };
      }
      case 'thisYear': {
        const start = new Date(now.getFullYear(), 0, 1);
        return { startDate: formatDate(start), endDate: formatDate(now) };
      }
      case 'lastYear': {
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return { startDate: formatDate(start), endDate: formatDate(end) };
      }
      case 'custom':
        if (customRange) {
          return { startDate: customRange.startDate, endDate: customRange.endDate };
        }
        return { month: now.getMonth() + 1, year: now.getFullYear() };
      default:
        return { month: now.getMonth() + 1, year: now.getFullYear() };
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = getReportParams();
      const pdfUri = await reportService.downloadPdf(params.month, params.year, {
        includeCharts,
        includeAi,
        includeCategories,
        includeComparison,
        startDate: params.startDate,
        endDate: params.endDate
      });
      onGenerated(pdfUri, params.month || 0, params.year || 0, params.startDate, params.endDate);
    } catch {
      Alert.alert('Erro', 'Falha ao gerar relatório. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <StatusBar barStyle="light-content" />
      <View className="flex-1 justify-end bg-black/70">
        <TouchableOpacity className="flex-1" onPress={onClose} />

        <View className="bg-surface-container-highest rounded-t-[24px] max-h-[85%] pb-8">
          {/* Drag Handle */}
          <View className="w-full items-center pt-4 pb-2">
            <View className="w-12 h-1.5 bg-outline-variant rounded-full opacity-50" />
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-headline-md font-semibold text-on-surface tracking-tight">
                Exportar relatório financeiro
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-surface-variant items-center justify-center"
              >
                <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Period Selector */}
            <View className="mb-6">
              <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
                Período
              </Text>
              <View className="bg-surface-container rounded-xl overflow-hidden border border-surface-variant">
                {periods.map((p, i) => {
                  const isSelected = selectedPeriod === p.key;
                  const isLast = i === periods.length - 1;
                  return (
                    <TouchableOpacity
                      key={p.key}
                      className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-surface-variant' : ''} ${isSelected ? 'bg-surface-container-high/50' : ''}`}
                      onPress={() => {
                        if (p.key === 'custom' && onCustomDate) {
                          onCustomDate();
                        } else {
                          setSelectedPeriod(p.key);
                        }
                      }}
                    >
                      <View>
                        <Text className={`text-body-md ${isSelected ? 'text-on-surface font-medium' : 'text-on-surface'}`}>
                          {p.label}
                        </Text>
                        {p.key === 'custom' && customRange && (
                          <Text className="text-[11px] text-primary font-medium mt-0.5">
                            {customRange.startDate.split('-').reverse().join('/')} - {customRange.endDate.split('-').reverse().join('/')}
                          </Text>
                        )}
                      </View>
                      <MaterialIcons
                        name={p.key === 'custom' ? 'chevron-right' : isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={22}
                        color={p.key === 'custom' ? Colors.outline : isSelected ? Colors.primaryContainer : Colors.outlineVariant}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Content Options */}
            <View className="mb-6">
              <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
                Opções de conteúdo
              </Text>
              <View className="gap-1">
                <CheckboxRow
                  label="Incluir gráficos"
                  checked={includeCharts}
                  onToggle={() => onIncludeChartsChange(!includeCharts)}
                />
                <CheckboxRow
                  label="Incluir resumo da IA"
                  checked={includeAi}
                  onToggle={() => onIncludeAiChange(!includeAi)}
                  trailingIcon="auto-awesome"
                  trailingIconColor={Colors.tertiary}
                />
                <CheckboxRow
                  label="Incluir categorias"
                  checked={includeCategories}
                  onToggle={() => onIncludeCategoriesChange(!includeCategories)}
                />
                <CheckboxRow
                  label="Incluir comparativo com mês anterior"
                  checked={includeComparison}
                  onToggle={() => onIncludeComparisonChange(!includeComparison)}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3 mt-2">
              <TouchableOpacity
                className="w-full h-14 rounded-full bg-primary-container items-center justify-center flex-row gap-2 shadow-md active:scale-[0.98]"
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.onPrimaryContainer} />
                ) : (
                  <>
                    <MaterialIcons name="picture-as-pdf" size={20} color={Colors.onPrimaryContainer} />
                    <Text className="text-label-md text-on-primaryContainer font-bold">Gerar PDF</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full h-14 rounded-full border border-outline-variant items-center justify-center active:scale-[0.98]"
                onPress={onClose}
                disabled={loading}
              >
                <Text className="text-label-md text-on-surface">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function CheckboxRow({
  label,
  checked,
  onToggle,
  trailingIcon,
  trailingIconColor,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  trailingIcon?: string;
  trailingIconColor?: string;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-3 px-3 -mx-3 rounded-lg"
      onPress={onToggle}
    >
      <View className="flex-row items-center gap-3">
        <MaterialIcons
          name={checked ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={checked ? Colors.primaryContainer : Colors.outlineVariant}
        />
        <Text className="text-body-md text-on-surface">{label}</Text>
      </View>
      {trailingIcon && (
        <MaterialIcons name={trailingIcon as any} size={16} color={trailingIconColor || Colors.onSurfaceVariant} />
      )}
    </TouchableOpacity>
  );
}
