import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, PanResponder,
  LayoutChangeEvent, Vibration,
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

// ─── Custom Slider ────────────────────────────────────────────────────────────

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Width at 0% fill (spent bar) relative to max */
  spentRatio: number;
  isOverLimit: boolean;
}

function LimitSlider({ value, min, max, onChange, spentRatio, isOverLimit }: SliderProps) {
  const trackRef = useRef<View>(null);
  const trackWidth = useRef(0);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const ratio = max > min ? (value - min) / (max - min) : 0;
  const thumbLeft = ratio * trackWidth.current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newRatio = Math.min(1, Math.max(0, x / (trackWidth.current || 1)));
        const newValue = Math.round(min + newRatio * (max - min));
        onChange(clamp(newValue));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newRatio = Math.min(1, Math.max(0, x / (trackWidth.current || 1)));
        const newValue = Math.round(min + newRatio * (max - min));
        onChange(clamp(newValue));
      },
    }),
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const spentBarW = Math.min(spentRatio, 1) * 100;
  const thumbPos = ratio * 100;
  const limitMarkerVisible = ratio < 0.98;
  const barColor = isOverLimit ? Colors.error : Colors.primary;

  return (
    <View className="relative pt-5 pb-3">
      {/* Limit label above thumb */}
      {limitMarkerVisible && (
        <View
          className="absolute top-0 items-center"
          style={{ left: `${thumbPos}%` as any, transform: [{ translateX: -18 }] }}
          pointerEvents="none"
        >
          <Text className="text-[10px] text-primary font-semibold">Limite</Text>
        </View>
      )}

      {/* Track + hit area */}
      <View
        ref={trackRef}
        onLayout={handleLayout}
        className="w-full h-10 justify-center"
        {...panResponder.panHandlers}
      >
        {/* Track background */}
        <View className="w-full h-2 bg-surface-variant rounded-full overflow-visible">
          {/* Spent fill */}
          <View
            className="h-full rounded-full absolute left-0 top-0"
            style={{ width: `${spentBarW}%`, backgroundColor: barColor }}
            pointerEvents="none"
          />
        </View>

        {/* Limit marker (vertical line) */}
        <View
          className="absolute w-[2px] h-7 bg-primary -top-2.5"
          style={{ left: `${thumbPos}%` as any, transform: [{ translateX: -1 }] }}
          pointerEvents="none"
        />

        {/* Thumb */}
        <View
          className="absolute w-6 h-6 rounded-full bg-primary shadow-md items-center justify-center"
          style={{
            left: `${thumbPos}%` as any,
            top: '50%',
            transform: [{ translateX: -12 }, { translateY: -12 }],
          }}
          pointerEvents="none"
        >
          <View className="w-2 h-2 rounded-full bg-on-primary" />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

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
        const categories = await transactionService.getCategories();
        const cat = categories.find((c) => c.id === categoryId) || null;
        setCategory(cat);

        const statuses = await budgetService.getBudgetStatus(currentMonth, currentYear);
        const status = statuses.find((s) => s.categoryId === categoryId);
        const currentSpent = status?.spent ?? 0;
        setSpent(currentSpent);

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

  /** AI-suggested limit: 115% of current spending or 100 default */
  const suggestedLimit = useMemo(() => {
    if (spent > 0) return Math.round(spent * 1.15 * 10) / 10;
    return 100;
  }, [spent]);

  const formattedSuggested = useMemo(
    () => formatCurrencyInput(String(Math.round(suggestedLimit * 100))),
    [suggestedLimit],
  );

  /** Slider range: min = 10% of spent (or 50), max = 300% of spent (or 2000) */
  const sliderMin = useMemo(() => (spent > 0 ? Math.round(spent * 0.1) : 50), [spent]);
  const sliderMax = useMemo(() => (spent > 0 ? Math.round(spent * 3) : 2000), [spent]);

  const projectionPercent = useMemo(() => {
    if (parsedLimit <= 0 || spent <= 0) return 0;
    return Math.round((spent / parsedLimit) * 100);
  }, [spent, parsedLimit]);

  const remaining = useMemo(() => {
    if (parsedLimit <= 0) return -spent;
    return parsedLimit - spent;
  }, [spent, parsedLimit]);

  const isOverLimit = remaining < 0;

  /** How much of the track the spent bar fills (relative to the slider range) */
  const spentRatio = useMemo(() => {
    const range = sliderMax - sliderMin;
    if (range <= 0) return 0;
    return (spent - sliderMin) / range;
  }, [spent, sliderMin, sliderMax]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const applyLimit = useCallback((value: number) => {
    const clamped = Math.max(0, value);
    setParsedLimit(clamped);
    const formatted = formatCurrencyInput(String(Math.round(clamped * 100)));
    setLimit(formatted);
  }, []);

  const handleTextChange = (text: string) => {
    const formatted = formatCurrencyInput(text);
    setLimit(formatted);
    const parsed = parseCurrencyInput(formatted);
    setParsedLimit(isNaN(parsed) ? 0 : parsed);
  };

  const handleSliderChange = useCallback((value: number) => {
    applyLimit(value);
  }, [applyLimit]);

  const handleSuggestionTap = () => {
    applyLimit(suggestedLimit);
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
    const parts = abs.toFixed(2).split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = `${intPart},${parts[1]}`;
    return value < 0 ? `- R$ ${formatted}` : `R$ ${formatted}`;
  };

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
        {/* ─── Header ─────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 h-14">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 rounded-full active:bg-surface-container"
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
            keyboardShouldPersistTaps="handled"
          >
            {/* ─── Category Context Card ──────────────────────────────── */}
            <View className="bg-surface-container rounded-xl p-4 flex-row items-center gap-4 mb-6 border border-surface-variant">
              <View
                className="w-12 h-12 rounded-full items-center justify-center shrink-0"
                style={{
                  backgroundColor: category?.color
                    ? `${category.color}20`
                    : `${Colors.secondaryContainer}`,
                }}
              >
                <MaterialIcons
                  name={(category?.icon || 'help-outline') as any}
                  size={24}
                  color={category?.color || Colors.onSecondaryContainer}
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
              <Text className="text-body-lg text-on-surface font-semibold">
                {formatMoney(spent)}
              </Text>
            </View>

            {/* ─── Limit Input Section ─────────────────────────────────── */}
            <View className="items-center mb-2">
              <Text className="text-label-md text-on-surface-variant mb-3">
                Novo Limite Mensal
              </Text>

              {/* Amount display */}
              <View className="items-center w-full max-w-[280px]">
                <View className="flex-row items-baseline">
                  <Text className="text-headline-md text-primary opacity-60 mr-1">R$</Text>
                  <TextInput
                    className="text-numeric-display text-primary text-center w-40 pb-1"
                    placeholder="0,00"
                    placeholderTextColor={Colors.outlineVariant}
                    keyboardType="numeric"
                    value={limit}
                    onChangeText={handleTextChange}
                    returnKeyType="done"
                  />
                </View>
                <View className="w-3/4 h-[2px] bg-primary rounded-full mt-1 opacity-80" />
              </View>

              {/* AI Suggestion Chip */}
              {spent > 0 && (
                <TouchableOpacity
                  className="mt-4 flex-row items-center gap-2 bg-secondary-container px-4 py-2 rounded-full active:scale-95"
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

            {/* ─── Visual Feedback / Slider Section ───────────────────── */}
            <View className="bg-surface-container-low rounded-xl p-4 mb-6 border border-surface-variant mt-6">
              {/* Stats row */}
              <View className="flex-row justify-between items-end mb-2">
                <View>
                  <Text className="text-label-sm text-on-surface-variant">Projeção</Text>
                  <Text
                    className={`text-body-md font-medium ${
                      parsedLimit > 0 && isOverLimit
                        ? 'text-error'
                        : 'text-on-surface'
                    }`}
                  >
                    {parsedLimit > 0 ? `${projectionPercent}% do limite` : '—'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-label-sm text-on-surface-variant">Restante</Text>
                  <Text
                    className={`text-body-md font-medium ${
                      parsedLimit > 0 && isOverLimit ? 'text-error' : 'text-primary'
                    }`}
                  >
                    {parsedLimit > 0 ? formatMoney(remaining) : '—'}
                  </Text>
                </View>
              </View>

              {/* Interactive Slider */}
              <LimitSlider
                value={Math.max(sliderMin, Math.min(sliderMax, parsedLimit || sliderMin))}
                min={sliderMin}
                max={sliderMax}
                onChange={handleSliderChange}
                spentRatio={spentRatio}
                isOverLimit={parsedLimit > 0 && isOverLimit}
              />

              {/* Ruler labels */}
              <View className="flex-row justify-between mt-1">
                <Text className="text-label-sm text-on-surface-variant opacity-60">
                  {formatMoney(sliderMin)}
                </Text>
                <Text className="text-label-sm text-on-surface-variant opacity-60">
                  {formatMoney(sliderMax)}
                </Text>
              </View>

              {/* Warning text */}
              {parsedLimit > 0 && isOverLimit && (
                <View className="mt-3 flex-row items-center gap-2 bg-error-container/30 rounded-lg px-3 py-2">
                  <MaterialIcons name="warning-amber" size={16} color={Colors.error} />
                  <Text className="text-label-sm text-error flex-1">
                    Atenção: O limite definido é menor que o seu gasto atual.
                  </Text>
                </View>
              )}
            </View>

            {/* ─── Notification Toggle ─────────────────────────────────── */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 bg-surface-container rounded-xl border border-surface-variant mb-6 active:bg-surface-container-high"
              onPress={() => setNotifyAt80(!notifyAt80)}
              activeOpacity={0.8}
            >
              <View className="flex-1 pr-4">
                <Text className="text-label-md text-on-surface">Notificar ao atingir 80%</Text>
                <Text className="text-label-sm text-on-surface-variant mt-1">
                  Receba um alerta antes de estourar o orçamento.
                </Text>
              </View>
              {/* Toggle Switch */}
              <View
                className={`w-12 h-6 rounded-full relative justify-center ${
                  notifyAt80 ? 'bg-primary-container' : 'bg-surface-container-highest'
                }`}
              >
                <View
                  className={`absolute w-5 h-5 rounded-full shadow-sm ${
                    notifyAt80
                      ? 'bg-on-primary-container right-[2px]'
                      : 'bg-on-surface-variant left-[2px]'
                  }`}
                />
              </View>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ─── Bottom Confirm Bar ──────────────────────────────────────── */}
        <View className="px-5 pt-4 pb-2 bg-surface/80 border-t border-surface-container-highest">
          <TouchableOpacity
            className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 active:scale-[0.98] ${
              parsedLimit > 0 ? 'bg-primary-container' : 'bg-surface-container opacity-60'
            }`}
            onPress={handleSave}
            disabled={loading || parsedLimit <= 0}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <>
                <MaterialIcons
                  name="check-circle"
                  size={22}
                  color={parsedLimit > 0 ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
                />
                <Text
                  className={`text-body-md font-bold ${
                    parsedLimit > 0 ? 'text-on-primary-container' : 'text-on-surface-variant'
                  }`}
                >
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
