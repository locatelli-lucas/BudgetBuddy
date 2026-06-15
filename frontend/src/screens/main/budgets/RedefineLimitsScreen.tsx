import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { budgetService } from '../../../services/budget.service';
import { BudgetStatusResponse } from '../../../types/budget';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

type BudgetRow = BudgetStatusResponse & {
  newLimitRaw: string;
  parsedLimit: number;
};

function formatMoney(value: number): string {
  const abs = Math.abs(value);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${intPart},${parts[1]}`;
}

export function RedefineLimitsScreen({ navigation }: any) {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // ─── Load data ────────────────────────────────────────────────────────
  const loadBudgets = useCallback(async () => {
    try {
      const data = await budgetService.getBudgetStatus(currentMonth, currentYear);
      setBudgets(
        data.map((b) => {
          const rawLimit = b.limit > 0 ? formatCurrencyInput(String(Math.round(b.limit * 100))) : '';
          return {
            ...b,
            newLimitRaw: rawLimit,
            parsedLimit: b.limit,
          };
        }),
      );
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  }, [loadBudgets]);

  // ─── Derived ──────────────────────────────────────────────────────────
  const totalLimit = useMemo(
    () => budgets.reduce((sum, b) => sum + b.parsedLimit, 0),
    [budgets],
  );

  const maxIndividualLimit = useMemo(
    () => Math.max(...budgets.map((b) => b.parsedLimit), 1),
    [budgets],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleLimitChange = (categoryId: string, text: string) => {
    const formatted = formatCurrencyInput(text);
    const parsed = parseCurrencyInput(formatted);
    setBudgets((prev) =>
      prev.map((b) =>
        b.categoryId === categoryId
          ? { ...b, newLimitRaw: formatted, parsedLimit: isNaN(parsed) ? 0 : parsed }
          : b,
      ),
    );
  };

  const handleSaveAll = async () => {
    const toSave = budgets.filter((b) => b.parsedLimit > 0);
    if (toSave.length === 0) {
      showError(new Error('Defina pelo menos um limite'));
      return;
    }

    setSaving(true);
    try {
      const promises = toSave.map((b) => {
        const request = {
          categoryId: b.categoryId,
          month: currentMonth,
          year: currentYear,
          limitAmount: b.parsedLimit,
        };
        if (b.id) {
          return budgetService.updateBudget(b.id, request);
        }
        return budgetService.createBudget(request);
      });

      await Promise.all(promises);
      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao salvar alguns limites');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Toast
        visible={toastVisible}
        message="Todos os limites foram atualizados!"
        type="success"
        onHide={() => setToastVisible(false)}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2 rounded-full"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-on-surface">Redefinir limites</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 160 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Global Budget Summary Card ──────────────────────────── */}
          <View className="bg-surface-container rounded-xl p-5 mb-6 border border-outline-variant/20">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-label-md text-on-surface-variant">Resumo Global Mensal</Text>
                <Text className="text-numeric-display text-primary mt-2">
                  {formatMoney(totalLimit)}
                </Text>
              </View>
              <View className="p-3 bg-primary-container rounded-lg">
                <MaterialIcons name="account-balance-wallet" size={24} color={Colors.onPrimaryContainer} />
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-label-sm text-on-surface-variant">
                  Total planejado para {MONTHS[now.getMonth()]}
                </Text>
                <Text className="text-label-sm text-primary font-medium">
                  {budgets.filter((b) => b.parsedLimit > 0).length} categorias
                </Text>
              </View>
              <View className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min((totalLimit / Math.max(totalLimit, 1)) * 100, 100)}%` }}
                />
              </View>
              <Text className="text-label-sm text-on-surface-variant mt-1">
                Mês de referência: {MONTHS[now.getMonth()]} de {now.getFullYear()}
              </Text>
            </View>
          </View>

          {/* ─── Categories List ─────────────────────────────────────── */}
          <Text className="text-label-md text-on-surface-variant uppercase tracking-widest mb-3">
            Categorias ativas
          </Text>

          <View className="gap-4">
            {budgets.map((b) => {
              const barPercent = maxIndividualLimit > 0
                ? Math.min((b.parsedLimit / maxIndividualLimit) * 100, 100)
                : 0;

              return (
                <View
                  key={b.categoryId}
                  className="bg-surface-container rounded-xl p-4 border border-outline-variant/30"
                >
                  {/* Row: icon, name, spending, limit input */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${b.categoryColor || Colors.primary}20` }}
                      >
                        <MaterialIcons
                          name={(b.categoryIcon || 'help-outline') as any}
                          size={20}
                          color={b.categoryColor || Colors.primary}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-label-md text-on-surface font-medium">{b.categoryName}</Text>
                        <Text className="text-label-sm text-on-surface-variant">
                          Gasto atual: {formatMoney(b.spent)}
                        </Text>
                      </View>
                    </View>
                    <View className="w-28">
                      <View className="flex-row items-center bg-surface-container-low rounded-lg py-2 px-3 border border-outline-variant/20">
                        <Text className="text-body-md text-on-surface-variant">R$</Text>
                        <TextInput
                          className="flex-1 text-body-md text-primary text-right"
                          placeholder="0,00"
                          placeholderTextColor={Colors.outline}
                          keyboardType="numeric"
                          value={b.newLimitRaw}
                          onChangeText={(text) => handleLimitChange(b.categoryId, text)}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Visual bar */}
                  <View className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: b.categoryColor || Colors.primary,
                      }}
                    />
                  </View>

                  {/* Min / Max labels */}
                  <View className="flex-row justify-between">
                    <Text className="text-label-sm text-on-surface-variant">Min R$ 0</Text>
                    <Text className="text-label-sm text-on-surface-variant">
                      Limite: {formatMoney(b.parsedLimit)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ─── Action Buttons ──────────────────────────────────────── */}
          <View className="mt-6 gap-3">
            <TouchableOpacity
              className="w-full h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2"
              onPress={handleSaveAll}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.onPrimaryContainer} />
              ) : (
                <>
                  <MaterialIcons name="save" size={24} color={Colors.onPrimaryContainer} />
                  <Text className="text-body-md text-on-primary-container font-bold">
                    Salvar novos limites
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full h-14 rounded-xl flex-row items-center justify-center"
              style={{ backgroundColor: `${Colors.secondaryContainer}50` }}
              onPress={() => navigation.goBack()}
            >
              <Text className="text-body-md text-secondary font-medium">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
