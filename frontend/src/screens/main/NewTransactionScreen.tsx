import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
  LayoutAnimation, UIManager, Modal, Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { transactionService } from '../../services/transaction.service';
import { aiService } from '../../services/ai.service';
import { Category, TransactionType, PaymentMethod } from '../../types/transaction';
import { FinancialResource } from '../../types/financialResource';
import { financialResourceService } from '../../services/financialResourceService';
import { installmentService } from '../../services/installmentService';
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
  { key: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: 'credit-card' },
  { key: 'DEBIT_CARD', label: 'Cartão de Débito', icon: 'credit-card' },
  { key: 'PIX', label: 'PIX', icon: 'pix' },
  { key: 'CASH', label: 'Dinheiro', icon: 'payments' },
  { key: 'TRANSFER', label: 'Transferência', icon: 'sync-alt' },
];

export function NewTransactionScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const defaultType = route.params?.defaultType || 'EXPENSE';
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>(defaultType);
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [selectedFinancialResourceId, setSelectedFinancialResourceId] = useState<string | null>(null);
  const [financialResources, setFinancialResources] = useState<FinancialResource[]>([]);
  const [installments, setInstallments] = useState(1);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { showError } = useErrorToast();

  const debouncedDescription = useDebounce(description, 1000);

  const loadData = useCallback(async () => {
    try {
      const [cats, resources] = await Promise.all([
        transactionService.getCategories(),
        financialResourceService.getAll(),
      ]);
      setCategories(cats);
      setFinancialResources(resources);
      if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (err) {
      showError(err, 'Failed to load initial data');
    } finally {
      setFetchingCategories(false);
    }
  }, [selectedCategoryId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Filter compatible resources when payment method changes
  useEffect(() => {
    const compatible = financialResources.filter(fr => {
      if (paymentMethod === 'CREDIT_CARD') return fr.type === 'CREDIT_CARD';
      if (paymentMethod === 'DEBIT_CARD') return fr.type === 'DEBIT_CARD' || fr.type === 'CHECKING_ACCOUNT';
      if (paymentMethod === 'PIX') return fr.type === 'CHECKING_ACCOUNT' || fr.type === 'SAVINGS_ACCOUNT' || fr.type === 'DIGITAL_WALLET';
      if (paymentMethod === 'TRANSFER') return fr.type === 'CHECKING_ACCOUNT' || fr.type === 'SAVINGS_ACCOUNT' || fr.type === 'DIGITAL_WALLET';
      if (paymentMethod === 'CASH') return fr.type === 'CASH_WALLET';
      return false;
    });

    if (compatible.length > 0) {
      setSelectedFinancialResourceId(compatible[0].id);
    } else {
      setSelectedFinancialResourceId(null);
    }
  }, [paymentMethod, financialResources]);

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
    if (paymentMethod !== 'CASH' && !selectedFinancialResourceId) {
      showError(new Error('Selecione uma conta ou cartão'));
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === 'CREDIT_CARD' && installments > 1) {
        // Create installment purchase
        await installmentService.create({
          description: description.trim(),
          totalAmount: parsedAmount,
          installmentsCount: installments,
          purchaseDate: selectedDate,
          categoryId: selectedCategoryId,
          financialResourceId: selectedFinancialResourceId!,
        });
      } else {
        await transactionService.createTransaction({
          categoryId: selectedCategoryId,
          type: transactionType,
          amount: parsedAmount,
          description: description.trim(),
          financialResourceId: selectedFinancialResourceId || undefined,
          paymentMethod: paymentMethod,
          date: selectedDate,
          isRecurring,
          notes: notes.trim() || undefined,
        });
      }

      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = financialResources.filter(fr => {
    if (paymentMethod === 'CREDIT_CARD') return fr.type === 'CREDIT_CARD';
    if (paymentMethod === 'DEBIT_CARD') return fr.type === 'DEBIT_CARD' || fr.type === 'CHECKING_ACCOUNT';
    if (paymentMethod === 'PIX') return fr.type === 'CHECKING_ACCOUNT' || fr.type === 'SAVINGS_ACCOUNT' || fr.type === 'DIGITAL_WALLET';
    if (paymentMethod === 'TRANSFER') return fr.type === 'CHECKING_ACCOUNT' || fr.type === 'SAVINGS_ACCOUNT' || fr.type === 'DIGITAL_WALLET';
    if (paymentMethod === 'CASH') return fr.type === 'CASH_WALLET';
    return false;
  });

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
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="p-2 -mr-2 rounded-full"
          >
            <MaterialIcons name="more-vert" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Options Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/20"
            onPress={() => setMenuVisible(false)}
          >
            <View
              className="absolute right-5 bg-surface-container rounded-2xl p-2 shadow-lg border border-outline-variant/20 min-w-[180px]"
              style={{ top: insets.top + 60 }}
            >
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('FinancialResourceForm');
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl active:bg-surface-variant"
              >
                <MaterialIcons name="add" size={20} color={Colors.primary} />
                <Text className="text-body-md text-on-surface font-medium">Adicionar Recurso</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  loadData();
                }}
                className="flex-row items-center gap-3 p-3 rounded-xl active:bg-surface-variant"
              >
                <MaterialIcons name="refresh" size={20} color={Colors.onSurfaceVariant} />
                <Text className="text-body-md text-on-surface">Atualizar Dados</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

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
          <View className="px-5 mb-6 items-center">
            <Text className="text-label-md text-on-surface-variant mb-2">Valor</Text>
            <View className="flex-row items-center justify-center">
              <Text className="text-headline-lg font-bold text-on-surface-variant mr-3 pt-1" style={{ includeFontPadding: false }}>R$</Text>
              <TextInput
                className="text-numeric-display text-on-background"
                style={{
                  includeFontPadding: false,
                  padding: 0,
                  margin: 0,
                  textAlignVertical: 'center'
                }}
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

            {/* Payment Method Selector - Step 1: How? */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface mb-1">Como você pagou?</Text>

              <View className="gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.key;
                  return (
                    <TouchableOpacity
                      key={method.key}
                      onPress={() => setPaymentMethod(method.key)}
                      className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'bg-surface-container border-outline-variant/30'
                      }`}
                    >
                      <View className="flex-row items-center gap-4">
                        <MaterialIcons
                          name={method.icon}
                          size={24}
                          color={isSelected ? Colors.primary : Colors.onSurfaceVariant}
                        />
                        <Text className={`text-title-md ${isSelected ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                          {method.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <MaterialIcons name="check" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Account/Card Selection - Step 2: From where? */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">
                {paymentMethod === 'CREDIT_CARD' ? 'Qual cartão?' : 'Qual conta?'}
              </Text>

              {filteredResources.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1">
                  <View className="flex-row gap-2">
                    {filteredResources.map(fr => (
                      <TouchableOpacity
                        key={fr.id}
                        onPress={() => setSelectedFinancialResourceId(fr.id)}
                        className={`px-4 py-3 rounded-xl border flex-row items-center gap-2 ${selectedFinancialResourceId === fr.id ? 'bg-primary-container border-primary' : 'bg-surface-container border-outline-variant/30'}`}
                      >
                        <MaterialIcons
                          name={fr.type === 'CREDIT_CARD' ? 'credit-card' : 'account-balance'}
                          size={18}
                          color={selectedFinancialResourceId === fr.id ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
                        />
                        <Text className={`text-label-md ${selectedFinancialResourceId === fr.id ? 'text-on-primary-container font-bold' : 'text-on-surface-variant'}`}>
                          {fr.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View className="bg-surface-container rounded-2xl p-6 items-center border border-dashed border-outline-variant/40 mt-1">
                   <Text className="text-label-md text-on-surface-variant text-center mb-4">
                     {paymentMethod === 'CREDIT_CARD' ? 'Nenhum cartão de crédito encontrado.' : 'Nenhuma conta compatível encontrada.'}
                   </Text>
                   <TouchableOpacity
                     onPress={() => navigation.navigate('FinancialResourceForm', { initialType: paymentMethod === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'CHECKING_ACCOUNT' })}
                     className="bg-primary/10 px-4 py-2 rounded-lg flex-row items-center gap-2"
                   >
                     <MaterialIcons name="add" size={20} color={Colors.primary} />
                     <Text className="text-label-md font-bold text-primary uppercase">Adicionar Recurso</Text>
                   </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Installments for Credit Card */}
            {paymentMethod === 'CREDIT_CARD' && (
              <View className="gap-2">
                <Text className="text-label-md text-on-surface">Parcelamento</Text>
                <View className="bg-surface-container rounded-2xl px-2 pt-2 border border-outline-variant/10">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                        <MaterialIcons name="event-repeat" size={18} color={Colors.primary} />
                      </View>
                      <Text className="text-body-md font-semibold text-on-surface">Número de parcelas</Text>
                    </View>
                    <View className="flex-row items-center bg-surface rounded-xl px-3 h-12 border border-outline-variant/30 min-w-[72px] justify-center">
                      <TextInput
                        className="text-title-md font-bold text-primary text-center"
                        style={{ minWidth: 32, height: '100%', paddingVertical: 0 }}
                        placeholder="1"
                        placeholderTextColor={Colors.outline}
                        keyboardType="numeric"
                        value={installments === 0 ? '' : installments.toString()}
                        onChangeText={(text) => {
                          const cleanText = text.replace(/[^0-9]/g, '');
                          if (cleanText === '') {
                            setInstallments(0);
                          } else {
                            const val = parseInt(cleanText);
                            setInstallments(val);
                          }
                        }}
                        onBlur={() => {
                          if (installments < 1) setInstallments(1);
                        }}
                      />
                      <Text className="text-label-md font-bold text-on-surface-variant ml-1">x</Text>
                    </View>
                  </View>

                  {installments > 1 && (
                    <View className="pt-3 border-t border-outline-variant/10 flex-row justify-between items-center py-4">
                      <Text className="text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">Valor por parcela</Text>
                      <Text className="text-body-md font-bold text-on-surface">
                        R$ {(parseCurrencyInput(amount) / installments).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

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
