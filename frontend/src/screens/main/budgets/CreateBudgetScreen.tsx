import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  LayoutAnimation, UIManager,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { transactionService } from '../../../services/transaction.service';
import { budgetService } from '../../../services/budget.service';
import { Category } from '../../../types/transaction';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatDateRangeLabel(startStr: string, endStr: string): string {
  const [sy, sm, sd] = startStr.split('-').map(Number);
  const [ey, em, ed] = endStr.split('-').map(Number);

  if (sy === ey && sm === em) {
    return `${sd} a ${ed} de ${MONTHS[sm - 1]} de ${sy}`;
  }
  if (sy === ey) {
    return `${sd} ${MONTHS_SHORT[sm - 1]} - ${ed} ${MONTHS_SHORT[em - 1]} ${sy}`;
  }
  return `${sd}/${sm}/${sy} - ${ed}/${em}/${ey}`;
}

function getMonthStart(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

function getMonthEnd(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

export function CreateBudgetScreen({ navigation, route }: any) {
  const params = route.params || {};
  const budgetId = params.budgetId;
  const initialCategoryId = params.categoryId || '';
  const initialLimit = params.limitAmount
    ? formatCurrencyInput(String(params.limitAmount * 100))
    : '';

  const [limit, setLimit] = useState(initialLimit);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [notifyAt80, setNotifyAt80] = useState(true);
  const { showError } = useErrorToast();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  const [startDateStr, setStartDateStr] = useState(getMonthStart(currentYear, currentMonth));
  const [endDateStr, setEndDateStr] = useState(getMonthEnd(currentYear, currentMonth));

  const dateRangeLabel = useMemo(
    () => formatDateRangeLabel(startDateStr, endDateStr),
    [startDateStr, endDateStr],
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await transactionService.getCategories();
        setCategories(data);
        if (data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        showError(err, 'Failed to load categories');
      } finally {
        setFetchingCategories(false);
      }
    }
    loadCategories();
  }, [selectedCategoryId]);

  const handleSave = async () => {
    const parsedLimit = parseCurrencyInput(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      showError(new Error('Informe um valor limite válido'));
      return;
    }
    if (!selectedCategoryId) {
      showError(new Error('Selecione uma categoria'));
      return;
    }

    setLoading(true);
    try {
      const [sYear, sMonth] = startDateStr.split('-').map(Number);
      const request = {
        categoryId: selectedCategoryId,
        month: sMonth,
        year: sYear,
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
      showError(err, 'Falha ao salvar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!budgetId) return;
    setLoading(true);
    try {
      await budgetService.deleteBudget(budgetId);
      navigation.goBack();
    } catch (err) {
      showError(err, 'Falha ao excluir orçamento');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1 }}>
      <Toast
        visible={toastVisible}
        message="Orçamento salvo com sucesso!"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 bg-surface z-50 border-b border-outline-variant/10"
          style={{ paddingTop: 8, paddingBottom: 16 }}
        >
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center rounded-full"
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text className="text-headline-md font-semibold text-on-surface">
              {budgetId ? 'Editar Orçamento' : 'Criar Orçamento'}
            </Text>
          </View>
          {budgetId ? (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <MaterialIcons name="delete" size={24} color={Colors.error} />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Input */}
          <View className="items-center mb-8">
            <Text className="text-label-md text-on-surface-variant mb-2">Limite Mensal</Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-headline-lg font-bold text-on-surface-variant mr-2">R$</Text>
              <TextInput
                className="text-numeric-display text-on-background text-center min-w-[150px]"
                placeholder="0,00"
                placeholderTextColor={Colors.outline}
                keyboardType="numeric"
                value={limit}
                onChangeText={(text) => setLimit(formatCurrencyInput(text))}
              />
            </View>
          </View>

          {/* Category Grid */}
          <View className="mb-6">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="text-label-md text-on-surface font-semibold">Categoria</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ManageCategories')}>
                <Text className="text-label-sm text-primary">Ver todas</Text>
              </TouchableOpacity>
            </View>
            {fetchingCategories ? (
              <ActivityIndicator color={Colors.primary} className="my-4" />
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  const disabled = !!budgetId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      className={`items-center justify-center gap-2 p-3 rounded-xl border ${isSelected
                        ? 'bg-primary-container border-primary/20'
                        : 'bg-surface-container border-transparent'
                        } ${disabled ? 'opacity-60' : ''}`}
                      style={{ width: '30%', marginBottom: 12 }}
                      disabled={disabled}
                      onPress={() => setSelectedCategoryId(cat.id)}
                    >
                      <MaterialIcons
                        name={(cat.icon || 'help-outline') as any}
                        size={28}
                        color={isSelected ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
                      />
                      <Text
                        className={`text-label-sm text-center ${isSelected ? 'text-on-primary-container' : 'text-on-surface-variant'
                          }`}
                        numberOfLines={2}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Settings Cards */}
          <View className="gap-2 mb-6">
            {/* Period Selector */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30"
              onPress={() => navigation.navigate('DatePicker', {
                mode: 'range',
                onSelect: ({ startDate, endDate }: { startDate: string; endDate: string }) => {
                  setStartDateStr(startDate);
                  setEndDateStr(endDate);
                },
              })}
            >
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 items-center justify-center rounded-lg bg-secondary-container">
                  <MaterialIcons name="date-range" size={20} color={Colors.onSecondaryContainer} />
                </View>
                <View>
                  <Text className="text-label-md text-on-surface">Período</Text>
                  <Text className="text-body-md text-on-surface-variant">{dateRangeLabel}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
            </TouchableOpacity>

            {/* Notification Toggle */}
            <View className="flex-row items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 items-center justify-center rounded-lg bg-tertiary-container/20">
                  <MaterialIcons name="notifications-active" size={20} color={Colors.tertiary} />
                </View>
                <View>
                  <Text className="text-label-md text-on-surface">Notificação de Limite</Text>
                  <Text className="text-body-md text-on-surface-variant">Avisar ao atingir 80%</Text>
                </View>
              </View>
              <TouchableOpacity
                className={`w-12 h-6 rounded-full px-1 justify-center ${notifyAt80 ? 'bg-primary-container items-end' : 'bg-surface-container-highest items-start'}`}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setNotifyAt80(!notifyAt80);
                }}
                activeOpacity={0.8}
              >
                <View className={`w-4 h-4 rounded-full ${notifyAt80 ? 'bg-on-primary-container' : 'bg-on-surface-variant'}`} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Inspirational Card */}
          <View className="relative h-40 overflow-hidden rounded-2xl bg-surface-container-low p-6 border border-outline-variant/20 mb-4">
            <LinearGradient
              colors={[`${Colors.primary}20`, 'rgba(0,0,0,0)']}
              style={{ position: 'absolute', right: -50, top: -50, width: 180, height: 180, borderRadius: 90 }}
            />
            <View className="flex-1 justify-center gap-2">
              <Text className="text-headline-md text-on-surface leading-tight">Mantenha o controle</Text>
              <Text className="text-body-md text-on-surface-variant" style={{ maxWidth: 200 }}>
                Usuários que criam orçamentos economizam 22% mais em média.
              </Text>
            </View>
            <MaterialIcons
              name="query-stats"
              size={56}
              color={Colors.primary}
              style={{ position: 'absolute', bottom: 12, right: 12, opacity: 0.4 }}
            />
          </View>
        </ScrollView>

        {/* Bottom Save Bar */}
        <View className="px-5 pt-4 pb-2 bg-surface/80 border-t border-surface-container-highest">
          <TouchableOpacity
            className="w-full h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <Text className="text-body-md text-on-primary-container font-bold">
                {budgetId ? 'Atualizar orçamento' : 'Criar orçamento'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
