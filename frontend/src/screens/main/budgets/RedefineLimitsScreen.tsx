import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image, PanResponder, LayoutChangeEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { budgetService } from '../../../services/budget.service';
import { useAuth } from '../../../contexts/AuthContext';
import { budgetService as service } from '../../../services/budget.service';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

// ─── Slider Component ────────────────────────────────────────────────────────

interface BudgetSliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  color: string;
}

function BudgetSlider({ value, max, onChange, color }: BudgetSliderProps) {
  const trackWidth = useRef(0);
  const clamp = (v: number) => Math.min(max, Math.max(0, v));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newRatio = Math.min(1, Math.max(0, x / (trackWidth.current || 1)));
        onChange(clamp(Math.round(newRatio * max)));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const newRatio = Math.min(1, Math.max(0, x / (trackWidth.current || 1)));
        onChange(clamp(Math.round(newRatio * max)));
      },
    }),
  ).current;

  const ratio = max > 0 ? value / max : 0;
  const thumbPos = ratio * 100;

  return (
    <View className="relative h-10 justify-center">
      <View
        onLayout={(e) => (trackWidth.current = e.nativeEvent.layout.width)}
        className="w-full h-1.5 bg-surface-container-highest rounded-full"
        {...panResponder.panHandlers}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${thumbPos}%`, backgroundColor: color }}
        />
      </View>
      <View
        className="absolute w-5 h-5 rounded-full bg-white shadow-md border-2"
        style={{
          left: `${thumbPos}%`,
          transform: [{ translateX: -10 }],
          borderColor: color,
        }}
        pointerEvents="none"
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function RedefineLimitsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Mock estimated income for the progress bar
  const estimatedIncome = 6250.0;

  const loadBudgets = useCallback(async () => {
    try {
      const data = await budgetService.getBudgetStatus(currentMonth, currentYear);
      setBudgets(
        data.map((b) => {
          const rawLimit = b.limit > 0 ? String(Math.round(b.limit)) : '0';
          return {
            ...b,
            newLimitRaw: rawLimit,
            parsedLimit: b.limit || 0,
          };
        }),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const totalLimit = useMemo(
    () => budgets.reduce((sum, b) => sum + b.parsedLimit, 0),
    [budgets],
  );

  const incomeUsageRatio = Math.min(totalLimit / estimatedIncome, 1);

  const handleLimitChange = (categoryId: string, value: number) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.categoryId === categoryId
          ? { ...b, parsedLimit: value, newLimitRaw: String(value) }
          : b,
      ),
    );
  };

  const handleTextChange = (categoryId: string, text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const value = parseInt(numeric || '0', 10);
    handleLimitChange(categoryId, value);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        budgets.map((b) => {
          const req = { categoryId: b.categoryId, month: currentMonth, year: currentYear, limitAmount: b.parsedLimit };
          return b.id ? budgetService.updateBudget(b.id, req) : budgetService.createBudget(req);
        })
      );
      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatMoneyFull = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      <Toast visible={toastVisible} message="Limites atualizados!" type="success" onHide={() => setToastVisible(false)} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white flex-1 ml-4">Redefinir limites</Text>
        <View className="w-10 h-10 rounded-full overflow-hidden border border-primary/30">
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-primary/20 items-center justify-center">
              <MaterialIcons name="person" size={24} color={Colors.primary} />
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Global Summary */}
        <View className="bg-[#1a1c26] rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
          <LinearGradient
            colors={[`${Colors.primary}15`, 'rgba(0,0,0,0)']}
            style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 80 }}
          />
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest opacity-60">Resumo Global Mensal</Text>
              <Text className="text-3xl font-bold text-white mt-1">{formatMoneyFull(totalLimit)}</Text>
            </View>
            <View className="p-3 bg-primary rounded-2xl">
              <MaterialIcons name="account-balance-wallet" size={24} color="#fff" />
            </View>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-xs text-on-surface-variant font-medium">Planejado vs. Renda</Text>
            <Text className="text-xs text-on-surface-variant font-bold">{Math.round(incomeUsageRatio * 100)}% da Renda</Text>
          </View>
          <View className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-3">
            <View className="h-full bg-primary rounded-full" style={{ width: `${incomeUsageRatio * 100}%` }} />
          </View>
          <Text className="text-xs text-on-surface-variant text-center italic opacity-70">
            Sua renda mensal estimada: <Text className="text-white font-bold">{formatMoneyFull(estimatedIncome)}</Text>
          </Text>
        </View>

        <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 opacity-70">Categorias Ativas</Text>

        <View className="gap-4">
          {budgets.map((b) => (
            <View key={b.categoryId} className="bg-[#1a1c26] rounded-2xl p-5 border border-white/5">
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-12 h-12 rounded-2xl bg-surface-container-highest items-center justify-center">
                    <MaterialIcons name={b.categoryIcon || 'category'} size={24} color={Colors.primary} />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-white">{b.categoryName}</Text>
                    <Text className="text-xs text-on-surface-variant opacity-60">
                      Gasto médio: {formatMoney(b.spent || 0)}
                    </Text>
                  </View>
                </View>
                <View className="bg-surface-container-highest px-4 py-3 rounded-xl min-w-[80px] items-end">
                  <TextInput
                    className="text-lg font-bold text-primary"
                    keyboardType="numeric"
                    value={b.newLimitRaw}
                    onChangeText={(t) => handleTextChange(b.categoryId, t)}
                    style={{ textAlign: 'right' }}
                  />
                </View>
              </View>

              <BudgetSlider
                value={b.parsedLimit}
                max={Math.max(b.parsedLimit * 1.5, b.spent * 1.5, 3000)}
                onChange={(v) => handleLimitChange(b.categoryId, v)}
                color={Colors.primary}
              />

              <View className="flex-row justify-between mt-1">
                <Text className="text-[10px] text-on-surface-variant font-medium opacity-50">Min R$ 0</Text>
                <Text className="text-[10px] text-on-surface-variant font-bold opacity-70">Limite: {formatMoney(b.parsedLimit)}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity className="w-full h-14 bg-primary rounded-2xl items-center justify-center mt-8 mb-3" onPress={handleSaveAll} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-base font-bold text-white">Salvar novos limites</Text>}
        </TouchableOpacity>

        <TouchableOpacity className="w-full h-14 bg-transparent border border-white/10 rounded-2xl items-center justify-center" onPress={() => navigation.goBack()}>
          <Text className="text-base font-bold text-on-surface-variant opacity-80">Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
