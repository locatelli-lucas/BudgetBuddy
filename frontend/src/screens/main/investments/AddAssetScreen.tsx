import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';
import { InvestmentType, Institution } from '../../../types/investment';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';

const INVESTMENT_TYPES: { key: InvestmentType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'STOCK', label: 'Ações', icon: 'show-chart' },
  { key: 'FII', label: 'FIIs', icon: 'domain' },
  { key: 'FIXED_INCOME', label: 'Renda Fixa', icon: 'account-balance' },
  { key: 'CRYPTO', label: 'Cripto', icon: 'currency-bitcoin' },
  { key: 'ETF', label: 'ETFs', icon: 'pie-chart' },
];

export function AddAssetScreen({ navigation, route }: any) {
  const params = route.params || {};
  const investmentId = params.investmentId;
  const editingAsset = params.asset;

  const [totalInvested, setTotalInvested] = useState('');
  const [selectedType, setSelectedType] = useState<InvestmentType>('STOCK');
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingInstitutions, setFetchingInstitutions] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const data = await investmentService.getInstitutions();
        setInstitutions(data);
      } catch (err) {
        console.error('Failed to load institutions', err);
      } finally {
        setFetchingInstitutions(false);
      }
    }
    loadInstitutions();

    if (editingAsset) {
      setTicker(editingAsset.ticker);
      setName(editingAsset.name);
      setSelectedType(editingAsset.type);
      setQuantity(String(editingAsset.quantity));
      setAvgPrice(String(editingAsset.avgPrice));
      setPurchaseDate(editingAsset.purchaseDate);
      setSelectedInstitutionId(editingAsset.institutionId || '');
      setTotalInvested(String(editingAsset.quantity * editingAsset.avgPrice));
    }
  }, [editingAsset]);

  // Sync total value if avg price or quantity is inputted
  useEffect(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(avgPrice.replace(',', '.'));
    if (!isNaN(q) && !isNaN(p)) {
      setTotalInvested((q * p).toFixed(2).replace('.', ','));
    }
  }, [quantity, avgPrice]);

  const handleSave = async () => {
    const parsedQty = parseFloat(quantity);
    const parsedPrice = parseFloat(avgPrice.replace(',', '.'));

    if (!ticker.trim()) {
      showError(new Error('Informe o código do ativo'));
      return;
    }
    if (!name.trim()) {
      showError(new Error('Informe o nome do ativo/empresa'));
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      showError(new Error('Informe uma quantidade válida'));
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showError(new Error('Informe o preço médio de aquisição'));
      return;
    }

    setLoading(true);
    try {
      const request = {
        ticker: ticker.trim().toUpperCase(),
        name: name.trim(),
        type: selectedType,
        quantity: parsedQty,
        avgPrice: parsedPrice,
        purchaseDate,
        institutionId: selectedInstitutionId || undefined,
      };

      if (investmentId) {
        await investmentService.updateInvestment(investmentId, request);
      } else {
        await investmentService.createInvestment(request);
      }

      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao salvar ativo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!investmentId) return;
    Alert.alert('Confirmação', 'Deseja remover este investimento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await investmentService.deleteInvestment(investmentId);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Erro', 'Falha ao remover ativo');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Toast visible={toastVisible} message="Ativo salvo com sucesso!" type="success" onHide={() => setToastVisible(false)} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 h-14 border-b border-outline-variant/20">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">
            {investmentId ? 'Editar Ativo' : 'Adicionar Ativo'}
          </Text>
          {investmentId ? (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <MaterialIcons name="delete" size={24} color={Colors.error} />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView className="flex-grow" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Valor total investido */}
          <View className="text-center py-6 items-center">
            <Text className="font-label-md text-on-surface-variant">Valor Total Investido</Text>
            <View className="flex-row items-center justify-center mt-2">
              <Text className="font-numeric-display text-primary mr-2">R$</Text>
              <Text className="font-numeric-display text-on-surface">{totalInvested || '0,00'}</Text>
            </View>
          </View>

          {/* Selection Types chips */}
          <View className="px-5 mb-6">
            <Text className="font-label-md text-on-surface-variant uppercase tracking-wider mb-3">Categorias</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {INVESTMENT_TYPES.map((type) => {
                  const active = selectedType === type.key;
                  return (
                    <TouchableOpacity
                      key={type.key}
                      onPress={() => setSelectedType(type.key)}
                      className={`h-10 px-4 rounded-xl flex-row items-center gap-1.5 border ${
                        active 
                          ? 'bg-primary-container border-transparent' 
                          : 'bg-surface-container border-outline-variant/30'
                      }`}
                    >
                      <MaterialIcons name={type.icon} size={18} color={active ? Colors.onPrimaryContainer : Colors.primary} />
                      <Text className={`font-label-md ${active ? 'text-on-primary-container font-semibold' : 'text-on-surface'}`}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Forms */}
          <View className="px-5 gap-4">
            <View className="space-y-2">
              <Text className="font-label-sm text-on-surface-variant">Código do Ativo</Text>
              <TextInput
                className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                placeholder="ex: PETR4, VALE3, BTC"
                placeholderTextColor={Colors.outline}
                autoCapitalize="characters"
                value={ticker}
                onChangeText={setTicker}
              />
            </View>

            <View className="space-y-2">
              <Text className="font-label-sm text-on-surface-variant">Nome da Empresa/Ativo</Text>
              <TextInput
                className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                placeholder="ex: Petrobras Distribuidora"
                placeholderTextColor={Colors.outline}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 space-y-2">
                <Text className="font-label-sm text-on-surface-variant">Quantidade</Text>
                <TextInput
                  className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                  placeholder="0"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
              <View className="flex-1 space-y-2">
                <Text className="font-label-sm text-on-surface-variant">Preço Médio (R$)</Text>
                <TextInput
                  className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  value={avgPrice}
                  onChangeText={setAvgPrice}
                />
              </View>
            </View>

            <View className="space-y-2">
              <Text className="font-label-sm text-on-surface-variant">Data de Aquisição (YYYY-MM-DD)</Text>
              <TextInput
                className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                placeholder="YYYY-MM-DD"
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>

            <View className="space-y-2">
              <Text className="font-label-sm text-on-surface-variant">Corretora / Broker</Text>
              {fetchingInstitutions ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <View className="bg-[#1E293B] border border-outline-variant rounded-xl overflow-hidden">
                  <FlatList
                    data={institutions}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const selected = selectedInstitutionId === item.id;
                      return (
                        <TouchableOpacity
                          onPress={() => setSelectedInstitutionId(item.id)}
                          className={`p-3 border-b border-outline-variant/10 flex-row items-center justify-between ${
                            selected ? 'bg-primary-container/20' : ''
                          }`}
                        >
                          <Text className="text-on-surface font-label-md">{item.name}</Text>
                          {selected && <MaterialIcons name="check" size={18} color={Colors.primary} />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => navigation.navigate('RegisteredInstitutions')}
                    className="p-3 bg-surface-container flex-row items-center justify-center gap-2"
                  >
                    <MaterialIcons name="add" size={18} color={Colors.primary} />
                    <Text className="text-primary font-bold text-label-sm">Gerenciar Corretoras</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Save Bar */}
        <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
          <TouchableOpacity
            className="w-full h-14 bg-primary rounded-xl items-center justify-center active:scale-[0.98]"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-on-primary font-bold text-label-md">Salvar Ativo</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
