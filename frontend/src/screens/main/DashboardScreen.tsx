import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { TransactionItem } from '../../components/TransactionItem';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { ExportReportSheet } from './ExportReportSheet';

export function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [showReportSheet, setShowReportSheet] = useState(false);

  const lineData = [
    { value: 50, label: 'Jan' },
    { value: 80, label: 'Fev' },
    { value: 90, label: 'Mar' },
    { value: 70, label: 'Abr' },
    { value: 100, label: 'Mai' },
    { value: 110, label: 'Jun' },
  ];

  const pieData = [
    { value: 48, color: Colors.primary },
    { value: 30, color: '#4ade80' },
    { value: 22, color: Colors.error },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View 
        className="flex-row justify-between items-center px-5 h-16 bg-surface z-50"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant/30">
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6cZcisaM0FEsmu5FK52FlImhbR1l8NknmkClMHrn_vyq8Xs1IfeC2If362TdpFqoLY66hku033afmEmYO6etPct6WRmjgNBStTyOjnXdImluVZ7dfzZ_QyQvZmzvj8qMOjWmRqYXnqSJdQYQu8c9rl4SmA3LyaGZKCj9MP9Kv08CztuMOX_ZrfxAWXhAT2hwT8FUr0LfywSqfyxmoD3rDx3tJJLWqgkPTh-Xtkf3e3b-cq1gWGeA4jl2eXvGFeeBnVMsHFpXnKz4' }}
              className="w-full h-full"
            />
          </View>
          <View>
            <Text className="text-headline-md font-bold text-on-surface">Olá, Lucas</Text>
            <Text className="text-label-md text-on-surface-variant">Veja como estão suas finanças</Text>
          </View>
        </View>
        <View className="flex-row gap-1">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full"
            onPress={() => setShowReportSheet(true)}
          >
            <MaterialIcons name="description" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
            <MaterialIcons name="notifications" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Balance Card */}
        <View className="bg-surface-variant rounded-xl p-6 shadow-md mb-6 relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full" />
          <Text className="text-label-md text-on-surface-variant">Saldo atual</Text>
          <Text className="text-numeric-display font-medium text-on-surface mt-1">R$ 8.420,50</Text>
          <View className="flex-row items-center gap-1 mt-2">
            <MaterialIcons name="trending-up" size={16} color="#4ade80" />
            <Text className="text-[#4ade80] text-label-md">+12% vs mês passado</Text>
          </View>
        </View>

        {/* Quick Summary Grid */}
        <View className="flex-row justify-between mb-8 gap-3">
          <View className="flex-1 bg-surface-variant rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-label-md text-on-surface-variant">Receitas</Text>
              <MaterialIcons name="arrow-downward" size={16} color="#4ade80" />
            </View>
            <Text className="text-body-lg font-bold text-on-surface mt-2">R$ 12.500</Text>
          </View>
          <View className="flex-1 bg-surface-variant rounded-xl p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <Text className="text-label-md text-on-surface-variant">Despesas</Text>
              <MaterialIcons name="arrow-upward" size={16} color={Colors.error} />
            </View>
            <Text className="text-body-lg font-bold text-on-surface mt-2">R$ 4.079</Text>
          </View>
        </View>

        {/* Charts Section */}
        <View className="mb-8">
          <View className="bg-surface-variant rounded-xl p-5 shadow-sm mb-4">
            <Text className="text-label-md text-on-surface-variant mb-4">Fluxo Mensal</Text>
            <View className="items-center">
              <LineChart
                data={lineData}
                width={250}
                height={120}
                thickness={3}
                color={Colors.primary}
                hideDataPoints
                hideYAxisText
                hideRules
                hideAxesAndRules
                xAxisLabelTextStyle={{ color: Colors.onSurfaceVariant, fontSize: 10 }}
              />
            </View>
          </View>

          <View className="bg-surface-variant rounded-xl p-5 shadow-sm flex-row items-center justify-between">
            <View>
              <Text className="text-label-md text-on-surface-variant mb-4">Gastos por Categoria</Text>
              <PieChart
                data={pieData}
                donut
                innerRadius={30}
                radius={45}
                centerLabelComponent={() => (
                  <Text className="text-on-surface text-label-md font-bold">48%</Text>
                )}
              />
            </View>
            <View className="flex-col gap-2">
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-primary" />
                <Text className="text-label-sm text-on-surface">Alimentação</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-[#4ade80]" />
                <Text className="text-label-sm text-on-surface">Moradia</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="w-3 h-3 rounded-full bg-error" />
                <Text className="text-label-sm text-on-surface">Transporte</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mb-4">
          <View className="flex-row justify-between items-end mb-4">
            <Text className="text-headline-md font-semibold text-on-surface">Transações recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text className="text-label-md text-primary">Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-surface-variant rounded-xl p-2 shadow-sm">
            <TransactionItem 
              id="1"
              title="Starbucks"
              subtitle="Alimentação • Hoje"
              amount={24.50}
              type="EXPENSE"
              icon="local-cafe"
            />
            <View className="h-[1px] bg-outline-variant/20 mx-3 my-1" />
            <TransactionItem 
              id="2"
              title="Netflix"
              subtitle="Entretenimento • Ontem"
              amount={55.90}
              type="EXPENSE"
              icon="movie"
            />
            <View className="h-[1px] bg-outline-variant/20 mx-3 my-1" />
            <TransactionItem 
              id="3"
              title="Salário"
              subtitle="Renda • 05 Mai"
              amount={12500.00}
              type="INCOME"
              icon="work"
            />
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton onPress={() => navigation.navigate('NewTransaction')} />

      <ExportReportSheet
        visible={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        onGenerated={(pdfUri) => {
          setShowReportSheet(false);
          navigation.navigate('ReportPreview', { pdfUri });
        }}
      />
    </View>
  );
}
