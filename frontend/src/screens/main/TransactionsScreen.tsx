import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { TransactionItem } from '../../components/TransactionItem';

export function TransactionsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar & Filters */}
      <View 
        className="bg-surface/90 pb-2 z-50 shadow-sm"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row justify-between items-center px-5 h-16">
          <Text className="text-headline-md font-bold text-on-surface">Transações</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
            <MaterialIcons name="more-vert" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-5 pb-2">
          <View className="flex-row items-center bg-surface-variant h-12 rounded-xl px-4 border border-transparent">
            <MaterialIcons name="search" size={20} color={Colors.outline} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Buscar transação..."
              placeholderTextColor={Colors.outline}
              className="flex-1 text-on-surface text-body-md"
            />
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-5 py-2"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          <View className="flex-row gap-2">
            <TouchableOpacity className="h-10 px-4 rounded-full bg-primary-container items-center justify-center">
              <Text className="text-on-primary-container font-label-md">Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity className="h-10 px-4 rounded-full bg-surface-variant items-center justify-center border border-outline-variant/10">
              <Text className="text-on-surface-variant font-label-md">Receitas</Text>
            </TouchableOpacity>
            <TouchableOpacity className="h-10 px-4 rounded-full bg-surface-variant items-center justify-center border border-outline-variant/10">
              <Text className="text-on-surface-variant font-label-md">Despesas</Text>
            </TouchableOpacity>
            <TouchableOpacity className="h-10 px-4 rounded-full bg-surface-variant items-center justify-center border border-outline-variant/10 flex-row gap-1">
              <Text className="text-on-surface-variant font-label-md">Este mês</Text>
              <MaterialIcons name="arrow-drop-down" size={16} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity className="h-10 px-4 rounded-full bg-surface-variant items-center justify-center border border-outline-variant/10">
              <Text className="text-on-surface-variant font-label-md">Categorias</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView 
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Group: Hoje */}
        <View className="mb-6">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Hoje</Text>
          <View className="bg-surface-variant rounded-xl p-2 shadow-sm">
            <TransactionItem 
              id="1"
              title="Uber"
              subtitle="Transporte • Cartão de Crédito"
              amount={24.90}
              type="EXPENSE"
              icon="directions-car"
            />
          </View>
        </View>

        {/* Group: Ontem */}
        <View className="mb-6">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Ontem</Text>
          <View className="bg-surface-variant rounded-xl p-2 shadow-sm">
            <TransactionItem 
              id="2"
              title="iFood"
              subtitle="Alimentação • Pix"
              amount={82.00}
              type="EXPENSE"
              icon="restaurant"
            />
            <View className="h-[1px] bg-outline-variant/20 mx-3 my-1" />
            <TransactionItem 
              id="3"
              title="Farmácia"
              subtitle="Saúde • Dinheiro"
              amount={45.50}
              type="EXPENSE"
              icon="local-hospital"
            />
          </View>
        </View>

        {/* Group: 15 de Maio */}
        <View className="mb-6">
          <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 ml-1">15 de Maio</Text>
          <View className="bg-surface-variant rounded-xl p-2 shadow-sm">
            <TransactionItem 
              id="4"
              title="Salário"
              subtitle="Renda • Transferência"
              amount={12500.00}
              type="INCOME"
              icon="work"
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
