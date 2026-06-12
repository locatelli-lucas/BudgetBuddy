import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { budgetService } from '../../../services/budget.service';
import { transactionService } from '../../../services/transaction.service';
import { Category } from '../../../types/transaction';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

export function DefineLimitScreen({ navigation, route }: any) {
  const params = route.params || {};
  const { budgetId, categoryId, categoryName } = params;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ─── State ────────────────────────────────────────────────────────────
  const [limit, setLimit] = useState('');
  const [parsedLimit, setParsedLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [notifyAt80, setNotifyAt80] = useState(true);

  // Data
  const [category, setCategory] = useState<Category | null>(null);
  const [spent, setSpent] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const { showError } = useErrorToast();

  // ─── Fetch data ───────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setDataLoading(true);
      try {
        // Fetch category info for icon/color
        const categories = await transactionService.getCategories();
        const cat = categories.find((c) => c.id === categoryId) || null;
        setCategory(cat);

        // Fetch current month spending
        const statuses = await budgetService.getBudgetStatus(currentMonth, currentYear);
        const status = statuses.find((s) => s.categoryId === categoryId);
        const currentSpent = status?.spent ?? 0;
        setSpent(currentSpent);

        // If editing an existing budget, set the current limit
        if (budgetId && status?.limit) {
          const formatted = formatCurrencyInput(String(Math.round(status.limit * 100)));
          setLimit(formatted);
          setParsedLimit(status.limit);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [categoryId, budgetId]);

  // ─── Derived ──────────────────────────────────────────────────────────
  /** AI-suggested limit: 85% of current spending, minimum R$ 50 */
  const suggestedLimit = useMemo(() => {
    if (spent > 0) {
      return Math.round(spent * 0.85 * 100) / 100;
    }
    return 100; // default suggestion
  }, [spent]);

  const formattedSuggested = useMemo(
    () => formatCurrencyInput(String(Math.round(suggestedLimit * 100))),
    [suggestedLimit],
  );

  const projectionPercent = useMemo(() => {
    if (parsedLimit <= 0 || spent <= 0) return 0;
    return Math.round((spent / parsedLimit) * 100);
  }, [spent, parsedLimit]);

  const remaining = useMemo(() => {
    if (parsedLimit <= 0) return -spent;
    return parsedLimit - spent;
  }, [spent, parsedLimit]);

  const isOverLimit = remaining < 0;

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleLimitChange = (text: string) => {
    const formatted = formatCurrencyInput(text);
    setLimit(formatted);
    const parsed = parseCurrencyInput(formatted);
    setParsedLimit(isNaN(parsed) ? 0 : parsed);
  };

  const handleSuggestionTap = () => {
    const formatted = formatCurrencyInput(String(Math.round(suggestedLimit * 100)));
    setLimit(formatted);
    setParsedLimit(suggestedLimit);
  };

  const handleSave = async () => {
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      showError(new Error('Informe um valor limite válido'));
      return;
    }

    setLoading(true);
    try {
      const request = {
        categoryId,
        month: currentMonth,
        year: currentYear,
        limitAmount: parsedLimit,
      };

      if (budgetId) {
        await budgetService.updateBudget(budgetId, request);
      } else {
        await budgetService.createBudget(request);
      }

      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao definir limite');
    } finally {
      setLoading(false);
    }
  };

  // ─── Format helpers ───────────────────────────────────────────────────
  const formatMoney = (value: number): string => {
    const abs = Math.abs(value);
    // Manual pt-BR formatting (avoids toLocaleString crash in Hermes)
    const parts = abs.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = `${intPart},${parts[1]}`;
    return value < 0 ? `- R$ ${formatted}` : `R$ ${formatted}`;
  };

  // ─── Progress bar values ──────────────────────────────────────────────
  const maxBarValue = Math.max(spent, parsedLimit, 1);
  const spentBarWidth = Math.min((spent / maxBarValue) * 100, 100);
  const limitMarkerPos = parsedLimit > 0 ? Math.min((parsedLimit / maxBarValue) * 100, 100) : 0;

  const barColor = isOverLimit ? Colors.error : Colors.primary;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Toast
        visible={toastVisible}
        message="Limite definido com sucesso!"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 h-14">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Definir Limite</Text>
          <View className="w-10" />
        </View>

        {dataLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={Colors.primary} size="large" />
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-5 pt-4"
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ─── Category Context Card ──────────────────────────────── */}
            <View className="bg-surface-container rounded-xl p-4 flex-row items-center gap-4 mb-6 border border-surface-variant">
              <View
                className="w-12 h-12 rounded-full items-center justify-center shrink-0"
                style={{ backgroundColor: category?.color ? `${category.color}20` : `${Colors.secondary}20` }}
              >
                <MaterialIcons
                  name={(category?.icon || 'help-outline') as any}
                  size={24}
                  color={category?.color || Colors.secondary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-label-md text-on-surface font-medium">
                  {category?.name || categoryName}
                </Text>
                <Text className="text-label-sm text-on-surface-variant mt-1">
                  Gasto atual neste mês
                </Text>
              </View>
              <View>
                <Text className="text-body-lg text-on-surface font-semibold">
                  {formatMoney(spent)}
                </Text>
              </View>
            </View>

            {/* ─── Limit Input Section ────────────────────────────────── */}
            <View className="items-center mb-8">
              <Text className="text-label-md text-on-surface-variant mb-2">Novo Limite Mensal</Text>
              <View className="relative w-full max-w-[280px] items-center">
                <View className="flex-row items-baseline justify-center">
                  <Text className="text-headline-md text-primary opacity-60 mr-1">R$</Text>
                  <TextInput
                    className="text-numeric-display text-primary text-center min-w-[120px] pb-2"
                    placeholder="0,00"
                    placeholderTextColor={Colors.outlineVariant}
                    keyboardType="numeric"
                    value={limit}
                    onChangeText={handleLimitChange}
                  />
                </View>
                <View className="w-3/4 h-[2px] bg-primary rounded-full mt-1" />
              </View>

              {/* AI Suggestion Chip */}
              {spent > 0 && (
                <TouchableOpacity
                  className="mt-4 flex-row items-center gap-2 bg-secondary-container px-4 py-2 rounded-full border border-transparent active:scale-95"
                  onPress={handleSuggestionTap}
                >
                  <MaterialIcons
                    name="auto-awesome"
                    size={16}
                    color={Colors.onSecondaryContainer}
                  />
                  <Text className="text-label-sm text-on-secondary-container font-medium">
                    Sugerido: {formattedSuggested}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ─── Visual Feedback Section ────────────────────────────── */}
            {parsedLimit > 0 && (
              <View className="bg-surface-container-low rounded-xl p-4 mb-6 border border-surface-variant">
                {/* Stats row */}
                <View className="flex-row justify-between items-end mb-4">
                  <View>
                    <Text className="text-label-sm text-on-surface-variant block">Projeção</Text>
                    <Text
                      className={`text-body-md font-medium ${isOverLimit ? 'text-error' : 'text-on-surface'}`}
                    >
                      {projectionPercent}% do limite
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-label-sm text-on-surface-variant block">Restante</Text>
                    <Text
                      className={`text-body-md font-medium ${isOverLimit ? 'text-error' : 'text-primary'}`}
                    >
                      {formatMoney(remaining)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="relative pt-1 pb-2">
                  {/* Track background */}
                  <View className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    {/* Spent indicator */}
                    <View
                      className="h-full rounded-full absolute left-0 top-0"
                      style={{
                        width: `${spentBarWidth}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </View>

                  {/* Limit marker */}
                  {parsedLimit > 0 && limitMarkerPos < 100 && (
                    <View
                      className="absolute top-0 w-[2px] h-10 bg-primary -translate-x-1/2"
                      style={{ left: `${limitMarkerPos}%` }}
                    >
                      <Text
                        className="absolute -top-5 text-[10px] text-primary font-semibold"
                        style={{ transform: [{ translateX: -20 }] }}
                      >
                        Limite
                      </Text>
                    </View>
                  )}
                </View>

                {/* Warning text */}
                {isOverLimit && (
                  <Text className="text-label-sm text-on-surface-variant text-center px-4 mt-2">
                    Atenção: O limite definido é menor que o seu gasto atual.
                  </Text>
                )}
              </View>
            )}

            {/* ─── Notification Toggle ────────────────────────────────── */}
            <View className="flex-row items-center justify-between p-4 bg-surface-container rounded-xl border border-surface-variant mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-label-md text-on-surface">Notificar ao atingir 80%</Text>
                <Text className="text-label-sm text-on-surface-variant mt-1">
                  Receba um alerta antes de estourar o orçamento.
                </Text>
              </View>
              <TouchableOpacity
                className={`w-12 h-6 rounded-full relative ${notifyAt80 ? 'bg-primary-container' : 'bg-surface-container-highest'}`}
                onPress={() => setNotifyAt80(!notifyAt80)}
              >
                <View
                  className={`absolute top-1 w-4 h-4 rounded-full ${
                    notifyAt80 ? 'bg-on-primary-container right-1' : 'bg-on-surface-variant left-1'
                  }`}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* ─── Bottom Confirm Bar ─────────────────────────────────────── */}
        <View className="px-5 pt-4 pb-2 bg-surface/80 border-t border-surface-container-highest">
          <TouchableOpacity
            className="w-full h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={24} color={Colors.onPrimaryContainer} />
                <Text className="text-body-md text-on-primary-container font-bold">
                  Confirmar Limite
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
