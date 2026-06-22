import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  LayoutAnimation, UIManager
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { transactionService } from '../../services/transaction.service';
import { aiService } from '../../services/ai.service';
import { Category, PaymentMethod } from '../../types/transaction';
import { useDebounce } from '../../hooks/useDebounce';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { Toast } from '../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency';

const MONTHS_DISPLAY = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')} de ${MONTHS_DISPLAY[m - 1]} de ${y}`;
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'CREDIT_CARD', label: 'Crédito', icon: 'credit-card' },
  { key: 'DEBIT_CARD', label: 'Débito', icon: 'credit-card' },
  { key: 'PIX', label: 'PIX', icon: 'pix' },
  { key: 'CASH', label: 'Dinheiro', icon: 'payments' },
  { key: 'TRANSFER', label: 'Transf.', icon: 'sync-alt' },
];

export function NewTransactionScreen({ navigation, route }: any) {
  const defaultType = route.params?.defaultType || 'EXPENSE';
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>(defaultType);
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const debouncedDescription = useDebounce(description, 1000);

  // Fetch real categories from API
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await transactionService.getCategories();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
        }
      } catch (err) {
        showError(err, 'Failed to load categories');
      } finally {
        setFetchingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // When switching transaction type, auto-select the first matching category
  useEffect(() => {
    if (categories.length > 0) {
      const matching = categories.filter((cat) => {
        if (transactionType === 'INCOME') return cat.type === 'INCOME' || cat.type === 'BOTH';
        return cat.type === 'EXPENSE' || cat.type === 'BOTH';
      });
      if (matching.length > 0 && !matching.find((c) => c.id === selectedCategoryId)) {
        setSelectedCategoryId(matching[0].id);
      }
    }
  }, [transactionType, categories]);

  // Trigger AI auto-categorization when description is typed
  useEffect(() => {
    const val = parseCurrencyInput(amount);
    if (debouncedDescription.trim().length > 2 && !isNaN(val) && val > 0) {
      aiService.autoCategorize({ description: debouncedDescription, amount: val })
        .then((res) => {
          if (res.categoryId) {
            setSelectedCategoryId(res.categoryId);
          }
        })
        .catch(() => { });
    }
  }, [debouncedDescription, amount]);

  const handleSave = async () => {
    const parsedAmount = parseCurrencyInput(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showError(new Error('Informe um valor válido'));
      return;
    }
    if (!description.trim()) {
      showError(new Error('Informe uma descrição'));
      return;
    }
    if (!selectedCategoryId) {
      showError(new Error('Selecione uma categoria'));
      return;
    }

    setLoading(true);
    try {
      await transactionService.createTransaction({
        categoryId: selectedCategoryId,
        type: transactionType,
        amount: parsedAmount,
        description: description.trim(),
        paymentMethod,
        date: selectedDate,
        isRecurring,
        notes: notes.trim() || undefined,
      });

      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <Toast
        visible={toastVisible}
        message="Transação salva com sucesso!"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* TopAppBar */}
        <View
          className="flex-row items-center justify-between px-5 bg-surface z-50 border-b border-outline-variant/10"
          style={{ paddingTop: 8, paddingBottom: 16 }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Nova transação</Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented Toggle */}
          <View className="px-5 mb-6">
            <View className="flex-row bg-surface-container rounded-lg p-1">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${transactionType === 'EXPENSE' ? 'bg-primary-container' : ''}`}
                onPress={() => setTransactionType('EXPENSE')}
              >
                <Text className={`text-center font-label-md ${transactionType === 'EXPENSE' ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                  Despesa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${transactionType === 'INCOME' ? 'bg-success' : ''}`}
                onPress={() => setTransactionType('INCOME')}
              >
                <Text className={`text-center font-label-md ${transactionType === 'INCOME' ? 'text-white' : 'text-on-surface-variant'}`}>
                  Receita
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View className="px-5 mb-6 items-center justify-center">
            <Text className="text-label-md text-on-surface-variant mb-2">Valor</Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-headline-lg font-bold text-on-surface-variant mr-2">R$</Text>
              <TextInput
                className="text-numeric-display text-on-background min-w-[150px]"
                placeholder="0,00"
                placeholderTextColor={Colors.outline}
                keyboardType="numeric"
                value={amount}
                onChangeText={(text) => setAmount(formatCurrencyInput(text))}
              />
            </View>
          </View>

          {/* Card Container for Fields */}
          <View className="bg-surface rounded-t-3xl flex-1 px-5 pt-6 pb-6 gap-6">
            {/* Category Selector */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Categoria</Text>
              {fetchingCategories ? (
                <ActivityIndicator color={Colors.primary} className="my-4" />
              ) : (
                <View className="flex-row flex-wrap mt-2 px-4 gap-2">
                  {categories
                    .filter((cat) => {
                      if (transactionType === 'INCOME') return cat.type === 'INCOME' || cat.type === 'BOTH';
                      return cat.type === 'EXPENSE' || cat.type === 'BOTH';
                    })
                    .map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        className="items-center gap-2 mb-4"
                        style={{ width: '23%' }}
                        onPress={() => setSelectedCategoryId(cat.id)}
                      >
                        <View className={`w-12 h-12 rounded-full items-center justify-center ${selectedCategoryId === cat.id
                          ? transactionType === 'INCOME' ? 'bg-success' : 'bg-primary-container'
                          : 'bg-surface-container'
                          }`}>
                          <MaterialIcons
                            name={(cat.icon || 'help-outline') as any}
                            size={22}
                            color={selectedCategoryId === cat.id
                              ? transactionType === 'INCOME' ? '#fff' : Colors.onPrimaryContainer
                              : Colors.onSurfaceVariant}
                          />
                        </View>
                        <Text className={`text-label-sm text-center truncate w-full ${selectedCategoryId === cat.id ? 'text-on-surface font-semibold' : 'text-on-surface-variant'
                          }`}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>

            {/* Description Input */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Descrição</Text>
              <View className="flex-row items-center bg-surface-container rounded-lg px-4 py-3">
                <MaterialIcons name="edit" size={20} color={Colors.outline} style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-body-md text-on-surface"
                  placeholder="Ex: Almoço de negócios"
                  placeholderTextColor={Colors.outline}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Date Picker */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Data</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-surface-container rounded-lg px-4 py-3"
                onPress={() =>
                  navigation.navigate('DatePicker', {
                    initialDate: selectedDate,
                    onSelect: (dateStr: string) => setSelectedDate(dateStr),
                  })
                }
              >
                <View className="flex-row items-center">
                  <MaterialIcons name="calendar-today" size={20} color={Colors.outline} style={{ marginRight: 12 }} />
                  <Text className="text-body-md text-on-surface">
                    {formatDisplayDate(selectedDate)}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Método de Pagamento</Text>
              <View className="flex-row flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    className={`py-2 px-3 rounded-full flex-row items-center gap-1.5 ${paymentMethod === method.key
                      ? 'bg-primary-container'
                      : 'bg-surface-container'
                      }`}
                    onPress={() => setPaymentMethod(method.key)}
                  >
                    <MaterialIcons
                      name={method.icon}
                      size={16}
                      color={paymentMethod === method.key ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
                    />
                    <Text className={`font-label-md ${paymentMethod === method.key ? 'text-on-primary-container font-semibold' : 'text-on-surface-variant'
                      }`}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recurring Toggle */}
            <View className="flex-row items-center justify-between py-2 border-t border-surface-container-highest mt-2 pt-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center">
                  <MaterialIcons name="repeat" size={20} color={Colors.onSurfaceVariant} />
                </View>
                <Text className="text-body-md text-on-surface mr-2">Pagamento recorrente</Text>
              </View>
              <TouchableOpacity
                className={`w-12 h-6 rounded-full px-1 justify-center ${isRecurring ? 'bg-primary-container items-end' : 'bg-surface-container items-start'}`}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsRecurring(!isRecurring);
                }}
                activeOpacity={0.8}
              >
                <View className={`w-4 h-4 rounded-full ${isRecurring ? 'bg-on-primary-container' : 'bg-on-surface-variant'}`} />
              </TouchableOpacity>
            </View>

            {/* Notes Textarea */}
            <View className="gap-2 mt-2">
              <Text className="text-label-md text-on-surface">Observações (opcional)</Text>
              <TextInput
                className="bg-surface-container rounded-lg px-4 py-3 text-body-md text-on-surface min-h-[80px]"
                placeholder="Adicione detalhes adicionais aqui..."
                placeholderTextColor={Colors.outline}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
          <TouchableOpacity
            className={`w-full h-14 rounded-xl flex-row items-center justify-center gap-2 active:scale-[0.98] ${transactionType === 'INCOME' ? 'bg-success' : 'bg-primary-container'}`}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={transactionType === 'INCOME' ? '#fff' : Colors.onPrimaryContainer} />
            ) : (
              <>
                <Text className={`text-body-md font-bold ${transactionType === 'INCOME' ? 'text-white' : 'text-on-primary-container'}`}>
                  Salvar transação
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
