import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { financialResourceService } from '../../../services/financialResourceService';
import { investmentService } from '../../../services/investment.service';
import { Institution } from '../../../types/investment';
import { FinancialResourceType } from '../../../types/financialResource';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';
import { formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

const TYPES: { key: FinancialResourceType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: 'credit-card' },
  { key: 'DEBIT_CARD', label: 'Cartão de Débito', icon: 'credit-card' },
  { key: 'CHECKING_ACCOUNT', label: 'Conta Corrente', icon: 'account-balance' },
  { key: 'SAVINGS_ACCOUNT', label: 'Poupança', icon: 'savings' },
  { key: 'DIGITAL_WALLET', label: 'Carteira Digital', icon: 'account-balance-wallet' },
  { key: 'CASH_WALLET', label: 'Carteira de Dinheiro', icon: 'payments' },
];

export function FinancialResourceFormScreen({ navigation, route }: any) {
  const editItem = route.params?.item;
  const [name, setName] = useState(editItem?.name || '');
  const [type, setType] = useState<FinancialResourceType>(editItem?.type || 'CHECKING_ACCOUNT');
  const [financialInstitutionId, setFinancialInstitutionId] = useState(editItem?.financialInstitution?.id || '');
  const [brand, setBrand] = useState(editItem?.brand || '');
  const [color, setColor] = useState(editItem?.color || '#000000');
  const [lastFourDigits, setLastFourDigits] = useState(editItem?.lastFourDigits || '');
  const [creditLimit, setCreditLimit] = useState(editItem?.creditLimit?.toString() || '');
  const [currentBalance, setCurrentBalance] = useState(editItem?.currentBalance?.toString() || '');
  const [invoiceClosingDay, setInvoiceClosingDay] = useState(editItem?.invoiceClosingDay?.toString() || '');
  const [invoiceDueDay, setInvoiceDueDay] = useState(editItem?.invoiceDueDay?.toString() || '');

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  useEffect(() => {
    async function load() {
      try {
        const data = await investmentService.getInstitutions();
        setInstitutions(data);
      } catch (err) {
        showError(err);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      showError(new Error('Nome é obrigatório'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        financialInstitutionId: financialInstitutionId || undefined,
        brand: brand.trim() || undefined,
        color: color.trim() || undefined,
        lastFourDigits: lastFourDigits.trim() || undefined,
        creditLimit: type === 'CREDIT_CARD' ? parseCurrencyInput(creditLimit) : undefined,
        currentBalance: type !== 'CREDIT_CARD' ? parseCurrencyInput(currentBalance) : undefined,
        invoiceClosingDay: type === 'CREDIT_CARD' ? parseInt(invoiceClosingDay) : undefined,
        invoiceDueDay: type === 'CREDIT_CARD' ? parseInt(invoiceDueDay) : undefined,
        isActive: true,
      };

      if (editItem) {
        await financialResourceService.update(editItem.id, payload);
      } else {
        await financialResourceService.create(payload);
      }

      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <Toast
        visible={toastVisible}
        message="Recurso financeiro salvo!"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center px-5 py-4 border-b border-outline-variant/10 bg-surface">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-sm font-bold text-primary ml-2">
            {editItem ? 'Editar Recurso' : 'Novo Recurso'}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-5 pt-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flex: 1 }}
        >
          <View className="gap-6">
            {/* Type Selector - Grouped Grid */}
            <View className="gap-3">
              <Text className="text-label-md text-on-surface">Tipo de Recurso</Text>

              <View className="gap-4">
                {/* Cards Group */}
                <View>
                  <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Cartões</Text>
                  <View className="flex-row gap-2">
                    {TYPES.filter(t => t.key.includes('CARD')).map((t) => (
                      <TouchableOpacity
                        key={t.key}
                        onPress={() => setType(t.key)}
                        className={`flex-1 px-4 py-3 rounded-2xl flex-row items-center justify-center gap-2 border ${type === t.key ? 'bg-primary-container border-primary' : 'bg-surface-container border-outline-variant/20'}`}
                      >
                        <MaterialIcons name={t.icon} size={20} color={type === t.key ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} />
                        <Text className={`font-label-md ${type === t.key ? 'text-on-primary-container font-bold' : 'text-on-surface-variant'}`}>
                          {t.label.split(' ')[2] || t.label.split(' ')[1]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Accounts & Wallets Group */}
                <View>
                  <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Contas e Carteiras</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {TYPES.filter(t => !t.key.includes('CARD')).map((t) => (
                      <TouchableOpacity
                        key={t.key}
                        onPress={() => setType(t.key)}
                        style={{ width: '48.5%' }}
                        className={`px-4 py-3 rounded-2xl flex-row items-center gap-3 border ${type === t.key ? 'bg-primary-container border-primary' : 'bg-surface-container border-outline-variant/20'}`}
                      >
                        <MaterialIcons name={t.icon} size={20} color={type === t.key ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} />
                        <Text className={`font-label-md ${type === t.key ? 'text-on-primary-container font-bold' : 'text-on-surface-variant'}`}>
                          {t.label.replace('Conta ', '').replace('Carteira ', '')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Name */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Nome Personalizado</Text>
              <TextInput
                className="bg-surface-container rounded-lg px-4 py-3 text-body-md text-on-surface"
                placeholder="Ex: Nubank Principal"
                placeholderTextColor={Colors.outline}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Institution */}
            {institutions.length > 0 && (
              <View className="gap-2">
                <Text className="text-label-md text-on-surface">Instituição / Banco</Text>
                <View className="flex-row flex-wrap gap-2">
                  {fetching ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    institutions.map((inst) => (
                      <TouchableOpacity
                        key={inst.id}
                        onPress={() => setFinancialInstitutionId(financialInstitutionId === inst.id ? '' : inst.id)}
                        className={`px-3 py-1.5 rounded-lg border ${financialInstitutionId === inst.id ? 'bg-primary-container border-primary' : 'bg-surface border-outline-variant/30'}`}
                      >
                        <Text className={`text-label-sm ${financialInstitutionId === inst.id ? 'text-on-primary-container font-bold' : 'text-on-surface-variant'}`}>
                          {inst.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            )}

            {/* Credit Card Specifics */}
            {type === 'CREDIT_CARD' ? (
              <View className="gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/10">
                <View className="gap-2">
                  <Text className="text-label-md text-on-surface">Limite de Crédito</Text>
                  <View className="flex-row items-center bg-surface rounded-lg px-4 h-12">
                    <Text className="text-body-md text-on-surface mr-2">R$</Text>
                    <TextInput
                      className="flex-1 text-body-md text-on-surface h-full"
                      placeholder="0,00"
                      placeholderTextColor={Colors.outline}
                      keyboardType="numeric"
                      value={formatCurrencyInput(creditLimit)}
                      onChangeText={setCreditLimit}
                    />
                  </View>
                </View>
                <View className="flex-row gap-4">
                  <View className="flex-1 gap-2">
                    <Text className="text-label-md text-on-surface">Dia Fechamento</Text>
                    <TextInput
                      className="bg-surface rounded-lg px-4 h-12 text-body-md text-on-surface"
                      placeholder="Ex: 5"
                      placeholderTextColor={Colors.outline}
                      keyboardType="numeric"
                      value={invoiceClosingDay}
                      onChangeText={setInvoiceClosingDay}
                    />
                  </View>
                  <View className="flex-1 gap-2">
                    <Text className="text-label-md text-on-surface">Dia Vencimento</Text>
                    <TextInput
                      className="bg-surface rounded-lg px-4 h-12 text-body-md text-on-surface"
                      placeholder="Ex: 12"
                      placeholderTextColor={Colors.outline}
                      keyboardType="numeric"
                      value={invoiceDueDay}
                      onChangeText={setInvoiceDueDay}
                    />
                  </View>
                </View>
              </View>
            ) : (
              /* Balance Specifics for other types */
              <View className="gap-2">
                <Text className="text-label-md text-on-surface">Saldo Atual</Text>
                <View
                  className="flex-row items-center bg-surface-container rounded-lg px-4"
                  style={{ height: 56 }}
                >
                  <Text className="text-body-md text-on-surface mr-2">R$</Text>
                  <TextInput
                    className="flex-1 text-body-md text-on-surface h-full"
                    placeholder="0,00"
                    placeholderTextColor={Colors.outline}
                    keyboardType="numeric"
                    value={formatCurrencyInput(currentBalance)}
                    onChangeText={setCurrentBalance}
                  />
                </View>
              </View>
            )}

            {/* Optional details (Card Brand and Last Digits) - Shown for Credit/Debit Cards */}
            {(type === 'CREDIT_CARD' || type === 'DEBIT_CARD') && (
              <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                    <Text className="text-label-md text-on-surface">Bandeira (opcional)</Text>
                    <TextInput
                      className="bg-surface-container rounded-lg px-4 py-3 text-body-md text-on-surface"
                      placeholder="Visa, Master..."
                      placeholderTextColor={Colors.outline}
                      value={brand}
                      onChangeText={setBrand}
                    />
                </View>
                <View className="flex-1 gap-2">
                    <Text className="text-label-md text-on-surface">Final Cartão</Text>
                    <TextInput
                      className="bg-surface-container rounded-lg px-4 py-3 text-body-md text-on-surface"
                      placeholder="1234"
                      placeholderTextColor={Colors.outline}
                      maxLength={4}
                      keyboardType="numeric"
                      value={lastFourDigits}
                      onChangeText={setLastFourDigits}
                    />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="p-5 border-t border-outline-variant/10 bg-surface">
          <TouchableOpacity
            className="w-full h-14 rounded-xl bg-primary-container items-center justify-center active:scale-[0.98]"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={Colors.onPrimaryContainer} /> : (
              <Text className="text-on-primary-container font-bold text-body-lg">Salvar Recurso</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
