import { useErrorToast } from '../../../contexts/ErrorToastContext';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { notificationService } from '../../../services/notification.service';
import { investmentService } from '../../../services/investment.service';
import { PriceAlert, AlertCondition } from '../../../types/notification';
import { AssetSearchResult } from '../../../types/investment';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

// ─── Asset Logo ──────────────────────────────────────────────────────────────

function getAssetLogoUrl(ticker: string): string {
  if (!ticker) return '';
  const token = process.env.EXPO_PUBLIC_LOGO_DEV_TOKEN;
  return `https://img.logo.dev/ticker/${ticker.toUpperCase()}?token=${token}&size=128`;
}

function AssetLogo({ ticker, size = 32 }: { ticker: string; size?: number }) {
  const [error, setError] = useState(false);
  const initials = ticker ? ticker.substring(0, 2).toUpperCase() : '??';

  if (error || !ticker) {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-lg bg-primary-container items-center justify-center"
      >
        <Text className="font-bold text-primary text-[10px]">{initials}</Text>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size }} className="rounded-lg bg-white overflow-hidden items-center justify-center">
      <Image
        source={{ uri: getAssetLogoUrl(ticker) }}
        style={{ width: size * 0.8, height: size * 0.8 }}
        resizeMode="contain"
        onError={() => setError(true)}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function PriceAlertsScreen({ navigation }: any) {
  const { showError } = useErrorToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New Alert Form
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [targetPrice, setTargetPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Asset search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AssetSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await notificationService.getPriceAlerts();
      setAlerts(data);
    } catch (err) {
      showError(err, 'Failed to load price alerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlerts();
  }, [loadAlerts]);

  // ─── Search ────────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setSymbol(text.toUpperCase());

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
      } catch {
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSelectAsset = useCallback((result: AssetSearchResult) => {
    setSymbol(result.symbol);
    setSearchQuery(result.symbol);
    setShowResults(false);
    setSearchResults([]);
  }, []);

  const resetModal = () => {
    setSymbol('');
    setSearchQuery('');
    setTargetPrice('');
    setCondition('ABOVE');
    setSearchResults([]);
    setShowResults(false);
  };

  // ─── Create ────────────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    Alert.alert('Excluir alerta', 'Deseja realmente excluir este alerta de preço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.deletePriceAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
          } catch {}
        }
      }
    ]);
  };

  const handleCreate = async () => {
    if (!symbol || !targetPrice) return;

    setSubmitting(true);
    try {
      await notificationService.createPriceAlert({
        symbol: symbol.toUpperCase(),
        condition,
        targetPrice: parseCurrencyInput(targetPrice),
      });
      setModalVisible(false);
      resetModal();
      loadAlerts();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao criar alerta. Verifique os dados.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14 border-b border-outline-variant/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Alertas de Preço</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="p-2 -mr-2">
          <MaterialIcons name="add" size={28} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View className="py-20 items-center">
              <MaterialIcons name="notifications-off" size={64} color={Colors.onSurfaceVariant} />
              <Text className="text-on-surface-variant text-body-lg mt-4 font-semibold">Nenhum alerta ativo</Text>
              <Text className="text-on-surface-variant text-label-md text-center mt-2">
                Toque no "+" para criar um novo alerta de preço para seus ativos.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-surface rounded-xl p-4 mb-3 border border-outline-variant/10 flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${item.isActive ? 'bg-primary/10' : 'bg-surface-container'}`}>
                  <MaterialIcons
                    name={item.condition === 'ABOVE' ? 'trending-up' : 'trending-down'}
                    size={24}
                    color={item.isActive ? Colors.primary : Colors.onSurfaceVariant}
                  />
                </View>
                <View>
                  <Text className="text-body-lg font-bold text-on-surface">{item.symbol}</Text>
                  <Text className="text-label-sm text-on-surface-variant">
                    {item.condition === 'ABOVE' ? 'Acima de' : 'Abaixo de'} {formatCurrency(item.targetPrice)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                {!item.isActive && (
                  <View className="px-2 py-1 rounded-md mr-2" style={{ backgroundColor: Colors.success + '20' }}>
                    <Text className="text-[10px] font-bold" style={{ color: Colors.success }}>DISPARADO</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
                  <MaterialIcons name="delete-outline" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* New Alert Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setModalVisible(false); resetModal(); }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-headline-sm font-bold text-on-surface">Novo Alerta</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetModal(); }}>
                <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              {/* Asset Search Field */}
              <View>
                <Text className="text-label-md text-on-surface-variant mb-2">Ativo</Text>
                <View className="relative">
                  <TextInput
                    className="bg-surface-container rounded-xl p-4 text-on-surface font-body-md pr-12"
                    style={{ color: Colors.onSurface }}
                    placeholder="Ex: PETR4, BTC-USD, AAPL"
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  {searching && (
                    <ActivityIndicator
                      color={Colors.primary}
                      size="small"
                      style={{ position: 'absolute', right: 14, top: 16 }}
                    />
                  )}
                </View>

                {/* Dropdown results */}
                {showResults && searchResults.length > 0 && (
                  <View
                    className="bg-surface-container border border-outline-variant/30 rounded-xl mt-1 overflow-hidden"
                    style={{ maxHeight: 220 }}
                  >
                    <FlatList
                      data={searchResults.slice(0, 6)}
                      keyExtractor={r => r.symbol}
                      scrollEnabled={searchResults.length > 4}
                      renderItem={({ item: r }) => (
                        <TouchableOpacity
                          className="flex-row items-center gap-3 px-4 py-3 border-b border-outline-variant/10"
                          onPress={() => handleSelectAsset(r)}
                        >
                          <AssetLogo ticker={r.symbol} size={32} />
                          <View className="flex-1">
                            <Text className="text-body-md text-on-surface font-medium">{r.symbol}</Text>
                            <Text className="text-label-sm text-on-surface-variant" numberOfLines={1}>{r.name}</Text>
                          </View>
                          <Text className="text-label-sm text-on-surface-variant">{r.exchange}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>

              {/* Condition */}
              <View>
                <Text className="text-label-md text-on-surface-variant mb-2">Condição</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setCondition('ABOVE')}
                    className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center gap-2 ${condition === 'ABOVE' ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                  >
                    <MaterialIcons name="trending-up" size={20} color={condition === 'ABOVE' ? 'white' : Colors.onSurfaceVariant} />
                    <Text className={`font-bold ${condition === 'ABOVE' ? 'text-white' : 'text-on-surface-variant'}`}>Acima de</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCondition('BELOW')}
                    className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center gap-2 ${condition === 'BELOW' ? 'bg-primary border-primary' : 'bg-surface border-outline-variant'}`}
                  >
                    <MaterialIcons name="trending-down" size={20} color={condition === 'BELOW' ? 'white' : Colors.onSurfaceVariant} />
                    <Text className={`font-bold ${condition === 'BELOW' ? 'text-white' : 'text-on-surface-variant'}`}>Abaixo de</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Target Price */}
              <View>
                <Text className="text-label-md text-on-surface-variant mb-2">Preço Alvo</Text>
                <TextInput
                  className="bg-surface-container rounded-xl p-4 text-on-surface font-body-md"
                  style={{ color: Colors.onSurface }}
                  placeholder="0,00"
                  placeholderTextColor={Colors.onSurfaceVariant}
                  value={targetPrice}
                  onChangeText={(text) => setTargetPrice(formatCurrencyInput(text))}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                className={`bg-primary rounded-xl p-4 items-center mt-2 ${submitting ? 'opacity-50' : ''}`}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-body-md">Criar Alerta</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

