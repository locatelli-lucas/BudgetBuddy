import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TransactionItem } from '../../components/TransactionItem';
import { usePagination } from '../../hooks/usePagination';
import { transactionService } from '../../services/transaction.service';
import { Transaction, TransactionFilter, TransactionType } from '../../types/transaction';
import { useDebounce } from '../../hooks/useDebounce';
import { formatSmartDate } from '../../utils/dates';

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Débito',
  PIX: 'Pix',
  CASH: 'Dinheiro',
  TRANSFER: 'Transferência',
  BANK_TRANSFER: 'Transferência Bancária',
};

export function TransactionsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);

  const {
    data: transactions,
    isLoading,
    isRefreshing,
    filters,
    refresh,
    loadMore,
    applyFilters,
  } = usePagination<Transaction, TransactionFilter>({
    fetchData: (page, size, f) => transactionService.getTransactions(page, size, f),
    initialFilters: { type: undefined },
  });

  // Apply search filter when debounced value updates
  useEffect(() => {
    applyFilters({ ...filters, search: debouncedSearch || undefined });
  }, [debouncedSearch]);

  // Refresh when screen gains focus (e.g. after creating a transaction)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const handleTypeSelect = (type: TransactionType | undefined) => {
    applyFilters({ ...filters, type });
  };

  // Group transactions by date helper
  const groupTransactionsByDate = (txs: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    txs.forEach((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(tx);
    });
    return Object.keys(groups).map((date) => ({
      date,
      data: groups[date],
    }));
  };

  const transactionGroups = groupTransactionsByDate(transactions);
  const activeType = filters?.type;
  const headerTitle = activeType === 'INCOME' ? 'Receitas' : activeType === 'EXPENSE' ? 'Despesas' : 'Transações';
  const headerAccent = activeType === 'INCOME' ? 'border-[#22C55E]' : activeType === 'EXPENSE' ? 'border-error' : 'border-transparent';

  return (
    <View className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Search Header */}
      <View
        className={`bg-surface/90 pb-4 z-50 border-b-2 ${headerAccent}`}
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row justify-between items-center px-5 h-14 mb-2">
          <Text className="text-headline-md font-bold text-on-surface">{headerTitle}</Text>
          <View className="w-10" />
        </View>

        {/* Search Input */}
        <View className="px-5 pb-2">
          <View className="flex-row items-center bg-[#1E293B] h-12 rounded-xl px-4 border border-transparent">
            <MaterialIcons name="search" size={20} color={Colors.outline} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Buscar transação..."
              placeholderTextColor={Colors.outline}
              className="flex-1 text-on-surface text-body-md"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Horizontal Chips */}
        <View className="h-12 justify-center">
          <FlatList
            horizontal
            data={[
              { label: 'Todas', value: undefined },
              { label: 'Receitas', value: 'INCOME' },
              { label: 'Despesas', value: 'EXPENSE' },
            ]}
            keyExtractor={(item) => item.label}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = filters?.type === item.value;
              return (
                <TouchableOpacity
                  onPress={() => handleTypeSelect(item.value as any)}
                  className={`h-10 px-4 rounded-full items-center justify-center mr-2 border ${
                    active 
                      ? 'bg-primary-container border-transparent' 
                      : 'bg-[#1E293B] border-outline-variant/10'
                  }`}
                >
                  <Text className={active ? 'text-on-primary-container font-label-md' : 'text-on-surface-variant font-label-md'}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={transactionGroups}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={Colors.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={
          !isLoading ? (
            <View className="flex-1 py-10 items-center">
              <Text className="text-on-surface-variant text-body-md">Nenhuma transação encontrada</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <View className="py-4">
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View className="mb-6">
            <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 ml-1">
              {item.date}
            </Text>
            <View className="bg-[#1E293B] rounded-xl p-2 shadow-md">
              {item.data.map((tx, idx) => (
                <View key={tx.id}>
                  <TransactionItem
                    id={tx.id}
                    title={tx.description}
                    subtitle={`${tx.category?.name || 'Outros'} • ${PAYMENT_LABELS[tx.paymentMethod] || tx.paymentMethod}`}
                    amount={tx.amount}
                    type={tx.type}
                    icon={(tx.category?.icon || 'help-outline') as any}
                    onPress={() => {}}
                  />
                  {idx < item.data.length - 1 && (
                    <View className="h-[1px] bg-outline-variant/20 mx-3 my-1" />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('NewTransaction', { defaultType: activeType })}
        className="absolute bottom-6 right-6 px-6 h-14 bg-primary rounded-2xl flex-row items-center justify-center shadow-lg z-50 gap-2"
      >
        <MaterialIcons name="add" size={24} color={Colors.onPrimary} />
        <Text className="text-on-primary font-bold text-label-md">Nova transação</Text>
      </TouchableOpacity>
    </View>
  );
}
