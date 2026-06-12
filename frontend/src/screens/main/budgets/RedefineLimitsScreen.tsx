import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { budgetService } from '../../../services/budget.service';
import { BudgetStatusResponse } from '../../../types/budget';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

export function RedefineLimitsScreen({ navigation }: any) {
  const [budgets, setBudgets] = useState<(BudgetStatusResponse & { newLimit: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const loadBudgets = useCallback(async () => {
    try {
      const now = new Date();
      const data = await budgetService.getBudgetStatus(now.getMonth() + 1, now.getFullYear());
      setBudgets(
        data.map((b) => ({
          ...b,
          newLimit: b.limit > 0 ? formatCurrencyInput(String(b.limit * 100)) : '',
        }))
      );
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBudgets();
    setRefreshing(false);
  }, [loadBudgets]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const now = new Date();
      const promises = budgets
        .filter((b) => b.newLimit && b.newLimit.trim())
        .map((b) => {
          const parsedLimit = parseCurrencyInput(b.newLimit);
          if (isNaN(parsedLimit) || parsedLimit <= 0) return null;
          const request = {
            categoryId: b.categoryId,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            limitAmount: parsedLimit,
          };
          if (b.id) {
            return budgetService.updateBudget(b.id, request);
          }
          return budgetService.createBudget(request);
        })
        .filter(Boolean);

      await Promise.all(promises);
      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao salvar alguns limites');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Toast visible={toastVisible} message="Todos os limites foram atualizados!" type="success" onHide={() => setToastVisible(false)} />
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Redefinir Limites</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          <Text className="text-body-md text-on-surface-variant mb-4">
            Ajuste todos os limites orçamentários para o mês atual.
          </Text>

          {budgets.map((b) => (
            <View key={b.categoryId} className="bg-surface rounded-xl p-4 mb-3 border border-outline-variant/10">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <MaterialIcons
                    name={(b.categoryIcon || 'help-outline') as any}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-body-md font-semibold text-on-surface">{b.categoryName}</Text>
                  <Text className="text-label-sm text-on-surface-variant">
                    Gasto atual: R$ {b.spent.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-label-md text-on-surface-variant">R$</Text>
                <TextInput
                  className="flex-1 bg-surface-container rounded-lg py-2 px-4 text-body-md text-on-surface"
                  placeholder="Novo limite"
                  placeholderTextColor={Colors.outline}
                  keyboardType="numeric"
                  value={b.newLimit}
                  onChangeText={(text) =>
                    setBudgets((prev) =>
                      prev.map((item) =>
                        item.categoryId === b.categoryId
                          ? { ...item, newLimit: formatCurrencyInput(text) }
                          : item
                      )
                    )
                  }
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
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
              <Text className="text-body-md text-on-primary-container font-bold">Salvar Todos</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
