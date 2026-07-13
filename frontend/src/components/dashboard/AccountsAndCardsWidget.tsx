import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FinancialResource } from '../../types/financialResource';

interface Props {
  data: FinancialResource[];
  onAdd: () => void;
  onPressItem: (item: FinancialResource) => void;
}

export function AccountsAndCardsWidget({ data, onAdd, onPressItem }: Props) {
  const accounts = data.filter(i => i.type !== 'CREDIT_CARD');
  const cards = data.filter(i => i.type === 'CREDIT_CARD');
  const netWorth = accounts.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

  return (
    <View className="mb-8">
      {/* Header with Title */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-headline-md font-semibold text-on-surface">Meus Recursos</Text>
      </View>

      {/* Full Width Net Worth Card - Matching Main Balance Style */}
      <View className="px-0">
        <View className="bg-surface-variant rounded-xl p-6 shadow-md relative overflow-hidden">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-xl bg-primary/20 items-center justify-center">
              <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text className="text-label-md text-on-surface-variant">Patrimônio Líquido</Text>
              <Text className="text-numeric-display font-medium text-on-surface mt-1">
                R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Horizontal List for Individual Items */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-5"
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 4 }}
      >
        {accounts.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onPressItem(item)}
            className="w-44 bg-surface-variant p-4 rounded-xl justify-between border border-outline-variant/20 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                <MaterialIcons
                  name={item.type === 'CASH_WALLET' ? 'payments' : 'account-balance'}
                  size={16}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{item.brand || 'BANCO'}</Text>
            </View>
            <View>
               <Text className="text-label-sm text-on-surface-variant font-medium mb-1" numberOfLines={1}>{item.name}</Text>
               <Text className="text-title-md font-bold text-on-surface">
                 R$ {(item.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </Text>
            </View>
          </TouchableOpacity>
        ))}

        {cards.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onPressItem(item)}
            className="w-44 bg-surface-variant p-4 rounded-xl justify-between border border-outline-variant/20 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                <MaterialIcons name="credit-card" size={16} color={Colors.primary} />
              </View>
              <Text className="text-[10px] text-outline font-bold tracking-widest">•••• {item.lastFourDigits}</Text>
            </View>
            <View>
               <Text className="text-label-sm text-on-surface-variant font-medium mb-1" numberOfLines={1}>{item.name}</Text>
               <Text className="text-title-md font-bold text-primary">
                 R$ {(item.creditLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </Text>
               <Text className="text-[9px] text-on-surface-variant uppercase font-bold mt-0.5">Limite Disponível</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
