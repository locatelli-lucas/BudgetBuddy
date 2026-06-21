import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, FlatList,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';
import {
  InvestmentType, Institution, AssetSearchResult, AssetTypeConfig,
} from '../../../types/investment';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';

// ─── Helpers ────────────────────────────────────────────────────────────

function formatMoney(val: number): string {
  const abs = Math.abs(val);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${intPart},${parts[1]}`;
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

function getAssetLogoUrl(ticker: string): string {
  if (!ticker) return '';
  const token = process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN;
  return `https://img.logo.dev/ticker/${ticker.toUpperCase()}?token=${token}&size=128`;
}

function AssetLogo({ ticker, size = 32, fallbackIcon }: { ticker: string, size?: number, fallbackIcon?: string }) {
  const [error, setError] = useState(false);
  const initials = ticker ? ticker.substring(0, 2).toUpperCase() : '??';

  if (error || !ticker) {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-lg bg-primary-container items-center justify-center"
      >
        {fallbackIcon ? (
           <MaterialIcons name={fallbackIcon as any} size={size * 0.6} color={Colors.onPrimaryContainer} />
        ) : (
          <Text className="font-bold text-primary text-[10px]">{initials}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size }} className="rounded-lg bg-white overflow-hidden flex items-center justify-center">
      <Image
        source={{ uri: getAssetLogoUrl(ticker) }}
        style={{ width: size * 0.8, height: size * 0.8 }}
        resizeMode="contain"
        onError={() => setError(true)}
      />
    </View>
  );
}

/** Simplify asset name by removing market suffixes */
function simplifyAssetName(name: string): string {
  if (!name) return '';
  // Remove common B3 suffixes: PN, ON, UNT, N1, N2, NM, SA, etc.
  return name
    .replace(/\s+(PN|ON|UNT|NM|N1|N2|SA|S\.A\.|S\/A|EJ|ED|CI|DRN|MB|BS|DIR|EDR|EST).*$/i, '')
    .trim();
}

/** Detect asset type from symbol */
function detectType(symbol: string): InvestmentType {
  const s = symbol.toUpperCase();
  if (s.endsWith('-USD') || s.startsWith('BTC') || s.startsWith('ETH')) return 'CRYPTO';
  if (s.match(/[A-Z]{4}11$/)) return 'FII';
  if (s.match(/[A-Z]{4}11$/)) return 'ETF'; // fall through to FII for Brazilian ETFs
  if (s.endsWith('.SA') && s.match(/[A-Z]{4}\d/)) return 'STOCK';
  return 'STOCK';
}

// ─── Type Config ─────────────────────────────────────────────────────────

const ASSET_CONFIGS: AssetTypeConfig[] = [
  {
    type: 'STOCK', label: 'Ações', icon: 'show-chart',
    description: 'Acompanhe ações e valorização de capital.',
    showQuantity: true, showAvgPrice: true, showTicker: true,
    showExchange: false, showWallet: false,
    showFixedIncomeFields: false, fractionalQuantity: false,
  },
  {
    type: 'FII', label: 'FIIs', icon: 'domain',
    description: 'Monitore rendimentos e performance de fundos imobiliários.',
    showQuantity: true, showAvgPrice: true, showTicker: true,
    showExchange: false, showWallet: false,
    showFixedIncomeFields: false, fractionalQuantity: false,
  },
  {
    type: 'ETF', label: 'ETFs', icon: 'pie-chart',
    description: 'Acompanhe exposição diversificada ao mercado.',
    showQuantity: true, showAvgPrice: true, showTicker: true,
    showExchange: false, showWallet: false,
    showFixedIncomeFields: false, fractionalQuantity: false,
  },
  {
    type: 'CRYPTO', label: 'Cripto', icon: 'currency-bitcoin',
    description: 'Acompanhe cotações de exchanges e carteiras.',
    showQuantity: true, showAvgPrice: true, showTicker: true,
    showExchange: true, showWallet: true,
    showFixedIncomeFields: false, fractionalQuantity: true,
  },
  {
    type: 'FIXED_INCOME', label: 'Renda Fixa', icon: 'account-balance',
    description: 'Simule retornos baseados em contratos de renda fixa.',
    showQuantity: false, showAvgPrice: false, showTicker: false,
    showExchange: false, showWallet: false,
    showFixedIncomeFields: true, fractionalQuantity: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────

export function AddAssetScreen({ navigation, route }: any) {
  const params = route.params || {};
  const investmentId = params.investmentId;
  const editingAsset = params.asset;

  // ─── State ──────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<InvestmentType>('STOCK');
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingInstitutions, setFetchingInstitutions] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [marketUnavailable, setMarketUnavailable] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fixed income
  const [fiInvestedAmount, setFiInvestedAmount] = useState('');
  const [fiMaturityDate, setFiMaturityDate] = useState('');
  const [fiYieldType, setFiYieldType] = useState<'FIXED' | 'CDI' | 'IPCA' | 'SELIC'>('CDI');
  const [fiRate, setFiRate] = useState(''); // rate value

  const config = useMemo(() => ASSET_CONFIGS.find((c) => c.type === selectedType)!, [selectedType]);

  // ─── Load institutions ──────────────────────────────────────────────
  const loadInstitutions = useCallback(async () => {
    try {
      const data = await investmentService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      console.error('Failed to load institutions', err);
    } finally {
      setFetchingInstitutions(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInstitutions();
    }, [loadInstitutions])
  );

  // ─── Pre-fill when editing ──────────────────────────────────────────
  useEffect(() => {
    if (editingAsset) {
      setTicker(editingAsset.ticker);
      setName(editingAsset.name);
      setSearchQuery(editingAsset.ticker);
      setSelectedType(editingAsset.type);
      setQuantity(String(editingAsset.quantity));
      setAvgPrice(String(editingAsset.avgPrice));
      setPurchaseDate(editingAsset.purchaseDate);
      setSelectedInstitutionId(editingAsset.institutionId || '');
    }
  }, [editingAsset]);

  // ─── Calculations ───────────────────────────────────────────────────
  const qty = parseFloat(quantity.replace(',', '.'));
  const price = parseFloat(avgPrice.replace(',', '.'));
  const invested = !isNaN(qty) && !isNaN(price) ? qty * price : 0;
  const curPrice = currentPrice ?? price;
  const currentVal = !isNaN(qty) ? qty * curPrice : 0;
  const profit = currentVal - invested;
  const profitPct = invested > 0 ? (profit / invested) * 100 : 0;

  // Fixed income sim
  const fiInvested = parseFloat(fiInvestedAmount.replace(',', '.'));
  const fiRateNum = parseFloat(fiRate.replace(',', '.'));
  const fiMaturityEst = useMemo(() => {
    if (isNaN(fiInvested) || isNaN(fiRateNum) || !fiMaturityDate) return null;
    const now = new Date();
    const mat = new Date(fiMaturityDate + 'T00:00:00');
    const years = Math.max(0, (mat.getTime() - now.getTime()) / (365.25 * 24 * 3600 * 1000));
    const rate = fiRateNum / 100;
    let final = fiInvested;
    if (fiYieldType === 'FIXED') final = fiInvested * (1 + rate * years);
    else if (fiYieldType === 'CDI') final = fiInvested * Math.pow(1 + 0.12 * rate, years);
    else if (fiYieldType === 'IPCA' || fiYieldType === 'SELIC') final = fiInvested * (1 + rate * years);
    final = Math.round(final * 100) / 100;
    return final;
  }, [fiInvested, fiRateNum, fiMaturityDate, fiYieldType]);

  // ─── Asset search ───────────────────────────────────────────────────
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);

    // Limpa a seleção atual ao começar uma nova busca ou apagar o campo
    if (!editingAsset) {
      setTicker(text);
      setName('');
      setCurrentPrice(null);
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (text.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await investmentService.searchMarketAssets(text.trim());
        setSearchResults(results);
        setShowResults(results.length > 0);
        setMarketUnavailable(false);
      } catch {
        setSearchResults([]);
        setShowResults(false);
        setMarketUnavailable(true);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSelectAsset = useCallback(async (result: AssetSearchResult) => {
    setTicker(result.symbol);
    setName(simplifyAssetName(result.name));
    const detected = detectType(result.symbol);
    setSelectedType(detected);
    setSearchQuery(result.symbol);
    setShowResults(false);
    setMarketUnavailable(false);

    // Fetch current price
    try {
      const quote = await investmentService.getMarketQuote(result.symbol);
      setCurrentPrice(quote.price);
      if (!avgPrice) setAvgPrice(quote.price.toFixed(2).replace('.', ','));
    } catch {
      // Keep current price null
    }
  }, [avgPrice]);

  // ─── Save ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!ticker.trim() && config.showTicker) {
      showError(new Error('Selecione um ativo'));
      return;
    }

    const parsedQty = parseFloat(quantity.replace(',', '.'));
    const parsedPrice = parseFloat(avgPrice.replace(',', '.'));

    if (config.showQuantity && (isNaN(parsedQty) || parsedQty <= 0)) {
      showError(new Error('Informe uma quantidade válida'));
      return;
    }
    if (config.showAvgPrice && (isNaN(parsedPrice) || parsedPrice <= 0)) {
      showError(new Error('Informe o preço médio'));
      return;
    }
    if (config.showFixedIncomeFields) {
      const fiAmt = parseFloat(fiInvestedAmount.replace(',', '.'));
      if (isNaN(fiAmt) || fiAmt <= 0) {
        showError(new Error('Informe o valor investido'));
        return;
      }
      if (!fiMaturityDate) {
        showError(new Error('Informe a data de vencimento'));
        return;
      }
    }

    setLoading(true);
    try {
      const request: any = config.showFixedIncomeFields
        ? {
            ticker: name.trim() || 'RENDA_FIXA',
            name: name.trim() || 'Renda Fixa',
            type: 'FIXED_INCOME',
            quantity: 1,
            avgPrice: parseFloat(fiInvestedAmount.replace(',', '.')),
            purchaseDate,
            institutionId: selectedInstitutionId || undefined,
          }
        : {
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
    } catch (err: any) {
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
        text: 'Remover', style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try { await investmentService.deleteInvestment(investmentId); navigation.goBack(); }
          catch { Alert.alert('Erro', 'Falha ao remover ativo'); }
          finally { setLoading(false); }
        },
      },
    ]);
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }} edges={['top']}>
      <Toast visible={toastVisible} message="Ativo salvo com sucesso!" type="success" onHide={() => setToastVisible(false)} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ flex: 1 }}
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
          ) : <View className="w-10" />}
        </View>

        <ScrollView
          className="flex-1"
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Summary Card ────────────────────────────────────────── */}
          {(ticker !== '' || name !== '') && (
            <View className="mx-5 mt-4 bg-[#1E293B] rounded-xl p-4 border border-outline-variant/30">
              <View className="flex-row items-center gap-3 mb-3">
                <View className="bg-primary-container px-2 py-1 rounded-full">
                  <Text className="text-label-sm text-on-primary-container font-medium">{config.label}</Text>
                </View>
                <Text className="text-body-md text-on-surface font-medium flex-1" numberOfLines={1}>
                  {name || ticker || '—'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-label-sm text-on-surface-variant">Total investido</Text>
                  <Text className="text-body-lg text-on-surface font-semibold">{formatMoney(invested)}</Text>
                </View>
                {!config.showFixedIncomeFields && currentPrice && (
                  <View>
                    <Text className="text-label-sm text-on-surface-variant">Valor atual</Text>
                    <Text className="text-body-lg text-on-surface font-semibold">{formatMoney(currentVal)}</Text>
                  </View>
                )}
                <View className="items-end">
                  <Text className="text-label-sm text-on-surface-variant">
                    {config.showFixedIncomeFields ? 'Estimado no venc.' : 'Lucro'}
                  </Text>
                  <Text className={`text-body-lg font-semibold ${profit >= 0 ? 'text-primary' : 'text-error'}`}>
                    {config.showFixedIncomeFields
                      ? fiMaturityEst ? formatMoney(fiMaturityEst) : '—'
                      : `${profit >= 0 ? '+' : ''}${profitPct.toFixed(1)}%`
                    }
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ─── Category Selector ───────────────────────────────────── */}
          <View className="px-5 mt-4 mb-4">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {ASSET_CONFIGS.map((cfg) => {
                  const active = selectedType === cfg.type;
                  return (
                    <TouchableOpacity
                      key={cfg.type}
                      onPress={() => setSelectedType(cfg.type)}
                      className={`h-10 px-4 rounded-xl flex-row items-center gap-1.5 border ${
                        active ? 'bg-primary-container border-transparent' : 'bg-surface-container border-outline-variant/30'
                      }`}
                    >
                      <MaterialIcons name={cfg.icon as any} size={18} color={active ? Colors.onPrimaryContainer : Colors.primary} />
                      <Text className={`text-label-md ${active ? 'text-on-primary-container font-semibold' : 'text-on-surface'}`}>
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            <Text className="text-label-sm text-on-surface-variant mt-2">{config.description}</Text>
          </View>

          {/* ─── Form ────────────────────────────────────────────────── */}
          <View className="px-5 gap-4">
            {/* Asset Search (stocks/FIIs/ETFs/crypto) */}
            {config.showTicker && (
              <View className="mb-1 relative">
                <Text className="text-label-sm text-on-surface-variant mb-2">Buscar Ativo</Text>
                <TextInput
                  className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                  placeholder="Digite o código ou nome (ex: PETR4, VALE3)"
                  placeholderTextColor={Colors.outline}
                  autoCapitalize="characters"
                  value={searchQuery}
                  onChangeText={editingAsset ? undefined : handleSearchChange}
                  editable={!editingAsset}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                />
                {searching && (
                  <ActivityIndicator color={Colors.primary} size="small" style={{ position: 'absolute', right: 16, top: 42 }} />
                )}

                {/* Dropdown results */}
                {showResults && searchResults.length > 0 && (
                  <View className="bg-[#1E293B] border border-outline-variant/30 rounded-xl mt-1 overflow-hidden">
                    {searchResults.slice(0, 6).map((r) => (
                      <TouchableOpacity
                        key={r.symbol}
                        className="flex-row items-center gap-3 px-4 py-3 border-b border-outline-variant/10"
                        onPress={() => handleSelectAsset(r)}
                      >
                        <AssetLogo ticker={r.symbol} size={32} fallbackIcon={config.icon} />
                        <View className="flex-1">
                          <Text className="text-body-md text-on-surface font-medium">{r.symbol}</Text>
                          <Text className="text-label-sm text-on-surface-variant" numberOfLines={1}>{r.name}</Text>
                        </View>
                        <Text className="text-label-sm text-on-surface-variant">{r.exchange}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {marketUnavailable && (
                  <View className="flex-row items-center gap-2 mt-2 bg-warning/10 rounded-lg px-3 py-2">
                    <MaterialIcons name="info" size={16} color={Colors.tertiary || '#F59E0B'} />
                    <Text className="text-label-sm text-on-surface-variant flex-1">
                      Informações de mercado indisponíveis. Este ativo será cadastrado manualmente.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Symbol (read-only after search) */}
            {config.showTicker && ticker ? (
              <View className="mb-1 bg-[#1E293B] rounded-xl py-3 px-4 border border-outline-variant/20">
                <Text className="text-label-sm text-on-surface-variant">Código</Text>
                <Text className="text-body-md text-on-surface font-medium">{ticker}</Text>
              </View>
            ) : null}

            {/* Name (read-only) */}
            {config.showTicker && name ? (
              <View className="mb-1 bg-[#1E293B] rounded-xl py-3 px-4 border border-outline-variant/20">
                <Text className="text-label-sm text-on-surface-variant">Nome do Ativo</Text>
                <Text className="text-body-md text-on-surface font-medium">{name}</Text>
              </View>
            ) : null}

            {/* Quantity */}
            {config.showQuantity && (
              <View className="flex-row gap-4">
                <View className="flex-1 mb-1">
                  <Text className="text-label-sm text-on-surface-variant mb-2">
                    Quantidade{config.fractionalQuantity ? ' (fracionada)' : ''}
                  </Text>
                  <TextInput
                    className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                    placeholder={config.fractionalQuantity ? '0.00045' : '0'}
                    placeholderTextColor={Colors.outline}
                    keyboardType="decimal-pad"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
                <View className="flex-1 mb-1">
                  <Text className="text-label-sm text-on-surface-variant mb-2">Preço Médio (R$)</Text>
                  <TextInput
                    className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                    placeholder="0,00"
                    placeholderTextColor={Colors.outline}
                    keyboardType="decimal-pad"
                    value={avgPrice}
                    onChangeText={setAvgPrice}
                  />
                </View>
              </View>
            )}

            {/* Current price display */}
            {config.showTicker && currentPrice && (
              <View className="flex-row gap-4 mb-1">
                <View className="flex-1 bg-[#1E293B] rounded-xl py-3 px-4 border border-outline-variant/20">
                  <Text className="text-label-sm text-on-surface-variant">Preço atual</Text>
                  <Text className="text-body-md text-on-surface font-medium">{formatMoney(currentPrice)}</Text>
                </View>
                <View className="flex-1 bg-[#1E293B] rounded-xl py-3 px-4 border border-outline-variant/20">
                  <Text className="text-label-sm text-on-surface-variant">Valor da posição</Text>
                  <Text className="text-body-md text-on-surface font-medium">{formatMoney(currentVal)}</Text>
                </View>
              </View>
            )}

            {/* Fixed Income fields */}
            {config.showFixedIncomeFields && (
              <>
                <View className="mb-1">
                  <Text className="text-label-sm text-on-surface-variant mb-2">Tipo de Produto</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {['CDB', 'Tesouro Direto', 'LCI', 'LCA', 'Debênture', 'Poupança', 'Outro'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        className={`px-3 py-2 rounded-full ${name === t ? 'bg-primary-container' : 'bg-surface-container'}`}
                        onPress={() => setName(t)}
                      >
                        <Text className={`text-label-sm ${name === t ? 'text-on-primary-container font-semibold' : 'text-on-surface-variant'}`}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mb-1">
                  <Text className="text-label-sm text-on-surface-variant mb-2">Valor Investido (R$)</Text>
                  <TextInput
                    className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                    placeholder="0,00"
                    placeholderTextColor={Colors.outline}
                    keyboardType="decimal-pad"
                    value={fiInvestedAmount}
                    onChangeText={setFiInvestedAmount}
                  />
                </View>

                <View className="mb-1">
                  <Text className="text-label-sm text-on-surface-variant mb-2">Tipo de Rendimento</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {([
                      { key: 'CDI' as const, label: '% CDI' },
                      { key: 'FIXED' as const, label: 'Taxa Fixa' },
                      { key: 'IPCA' as const, label: 'IPCA +' },
                      { key: 'SELIC' as const, label: 'Selic +' },
                    ]).map((opt) => (
                      <TouchableOpacity
                        key={opt.key}
                        className={`px-3 py-2 rounded-full ${fiYieldType === opt.key ? 'bg-primary-container' : 'bg-surface-container'}`}
                        onPress={() => setFiYieldType(opt.key)}
                      >
                        <Text className={`text-label-sm ${fiYieldType === opt.key ? 'text-on-primary-container font-semibold' : 'text-on-surface-variant'}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-4 mb-1">
                  <View className="flex-1">
                    <Text className="text-label-sm text-on-surface-variant mb-2">
                      {fiYieldType === 'FIXED' ? 'Taxa Anual (%)' : fiYieldType === 'CDI' ? '% do CDI' : 'Taxa Adicional (%)'}
                    </Text>
                    <TextInput
                      className="w-full bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 font-body-md text-on-surface"
                      placeholder="0,00"
                      placeholderTextColor={Colors.outline}
                      keyboardType="decimal-pad"
                      value={fiRate}
                      onChangeText={setFiRate}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-label-sm text-on-surface-variant mb-2">Vencimento</Text>
                    <TouchableOpacity
                      className="flex-row items-center justify-between bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4"
                      onPress={() => navigation.navigate('DatePicker', {
                        initialDate: fiMaturityDate || purchaseDate,
                        onSelect: (dateStr: string) => setFiMaturityDate(dateStr),
                      })}
                    >
                      <Text className="font-body-md text-on-surface">
                        {fiMaturityDate ? formatDateDisplay(fiMaturityDate) : 'Selecionar'}
                      </Text>
                      <MaterialIcons name="calendar-today" size={20} color={Colors.outline} />
                    </TouchableOpacity>
                  </View>
                </View>

                {fiMaturityEst && (
                  <View className="bg-[#1E293B] rounded-xl p-4 border border-outline-variant/20">
                    <Text className="text-label-md text-on-surface mb-2">Simulação</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-label-sm text-on-surface-variant">Valor no vencimento</Text>
                      <Text className="text-body-md text-primary font-semibold">{formatMoney(fiMaturityEst)}</Text>
                    </View>
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-label-sm text-on-surface-variant">Lucro estimado</Text>
                      <Text className="text-body-md text-primary font-semibold">{formatMoney(fiMaturityEst - fiInvested)}</Text>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Purchase Date */}
            <View className="mb-1">
              <Text className="text-label-sm text-on-surface-variant mb-2">Data de Aquisição</Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4"
                onPress={() => navigation.navigate('DatePicker', {
                  initialDate: purchaseDate,
                  onSelect: (dateStr: string) => setPurchaseDate(dateStr),
                })}
              >
                <Text className="font-body-md text-on-surface">{formatDateDisplay(purchaseDate)}</Text>
                <MaterialIcons name="calendar-today" size={20} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            {/* Broker / Institution */}
            <View className="mb-1">
              <Text className="text-label-sm text-on-surface-variant mb-2">Corretora / Broker</Text>
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
                          className={`p-3 border-b border-outline-variant/10 flex-row items-center justify-between ${selected ? 'bg-primary-container/20' : ''}`}
                        >
                          <Text className={`font-label-md ${selected ? 'text-on-primary-container' : 'text-on-surface'}`}>{item.name}</Text>
                          {selected && <MaterialIcons name="check" size={18} color={Colors.primary} />}
                        </TouchableOpacity>
                      );
                    }}
                    ListEmptyComponent={
                      <View className="p-3 items-center">
                        <Text className="text-on-surface-variant text-label-sm">Nenhuma corretora cadastrada</Text>
                      </View>
                    }
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
            className="w-full h-14 bg-primary-container rounded-xl items-center justify-center"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <Text className="text-on-primary-container font-bold text-label-md">Salvar Ativo</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
