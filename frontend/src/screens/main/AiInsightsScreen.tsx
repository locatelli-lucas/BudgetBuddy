import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export function AiInsightsScreen({ navigation }: any) {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* TopAppBar */}
      <View className="px-5 py-4 flex-row justify-between items-center z-50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2">
            <MaterialIcons name="arrow-back" size={24} color="#e1e2ed" />
          </TouchableOpacity>
          <Text className="text-primary text-headline-md font-bold">BudgetBuddy Insights</Text>
        </View>
        <TouchableOpacity className="p-2 rounded-full hover:bg-surface-container-high">
          <MaterialIcons name="notifications" size={24} color="#b4c5ff" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-32" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-on-surface text-headline-lg font-bold mb-2">Insights</Text>
          <Text className="text-on-surface-variant text-body-md">
            Recomendações baseadas no seu comportamento financeiro
          </Text>
        </View>

        {/* Card 1: Delivery */}
        <View className="bg-surface-container rounded-xl p-5 mb-4 border border-outline-variant/30">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-12 h-12 rounded-full bg-primary-container/20 items-center justify-center">
              <MaterialIcons name="delivery-dining" size={28} color="#2563EB" />
            </View>
            <View>
              <Text className="text-on-surface text-body-lg font-bold">Gastos com Delivery</Text>
              <Text className="text-error text-label-sm font-bold uppercase tracking-wider">Alerta de tendência</Text>
            </View>
          </View>
          <Text className="text-on-surface-variant text-body-md mb-4">
            Você gastou <Text className="text-error font-semibold">18% mais</Text> com delivery este mês em comparação à sua média habitual.
          </Text>
          <View className="p-4 bg-background/40 rounded-lg border-l-4 border-primary mb-4">
            <Text className="text-on-surface text-body-md italic">
              "Reduzindo 2 pedidos por semana você economizaria cerca de <Text className="text-primary font-bold">R$ 320</Text> por mês."
            </Text>
          </View>
          <TouchableOpacity className="w-full py-3 bg-secondary-container rounded-full items-center justify-center">
            <Text className="text-on-secondary-container font-label-md font-bold">Ver detalhes</Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Emergency Fund */}
        <View className="bg-surface-container rounded-xl p-5 mb-4 border border-outline-variant/30">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-12 h-12 rounded-full bg-tertiary-container/20 items-center justify-center">
              <MaterialIcons name="shield" size={28} color="#ffb596" />
            </View>
            <View>
              <Text className="text-on-surface text-body-lg font-bold">Reserva de Emergência</Text>
              <Text className="text-primary text-label-sm font-bold uppercase tracking-wider">Progresso Estável</Text>
            </View>
          </View>
          <Text className="text-on-surface-variant text-body-md mb-4">
            Sua reserva atual cobre <Text className="text-on-surface font-semibold">4 meses</Text> de despesas essenciais.
          </Text>
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-on-surface-variant text-label-sm">Meta: 6 meses</Text>
              <Text className="text-on-surface-variant text-label-sm">66%</Text>
            </View>
            <View className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <View className="h-full bg-primary rounded-full" style={{ width: '66%' }} />
            </View>
          </View>
        </View>

        {/* Card 3: Leisure Budget */}
        <View className="bg-surface-container rounded-xl p-5 mb-24 border border-outline-variant/30">
          <View className="flex-row items-center gap-4 mb-4">
            <View className="w-12 h-12 rounded-full bg-error-container/20 items-center justify-center">
              <MaterialIcons name="warning" size={28} color="#EF4444" />
            </View>
            <View>
              <Text className="text-on-surface text-body-lg font-bold">Orçamento de Lazer</Text>
              <Text className="text-error text-label-sm font-bold uppercase tracking-wider">Limite Excedido</Text>
            </View>
          </View>
          <Text className="text-on-surface-variant text-body-md mb-2">
            Você ultrapassou o orçamento em <Text className="text-error font-semibold">R$ 150</Text> esta semana.
          </Text>
          <Text className="text-on-surface-variant text-body-md">
            Recomendação: Tente reduzir gastos não essenciais na próxima semana para reequilibrar seu saldo.
          </Text>
        </View>
      </ScrollView>

      {/* AI Assistant Floating Input */}
      <View className="absolute bottom-[20px] left-5 right-5 z-40">
        <View className="bg-surface-variant/90 border border-outline-variant/30 rounded-full px-5 py-2 flex-row items-center gap-3 shadow-2xl">
          <MaterialIcons name="auto-awesome" size={24} color="#b4c5ff" />
          <TextInput
            className="flex-1 text-on-surface font-body-md py-2"
            placeholder="Pergunte ao BudgetBuddy AI..."
            placeholderTextColor="#8d90a0"
          />
          <TouchableOpacity className="w-10 h-10 rounded-full bg-primary items-center justify-center">
            <MaterialIcons name="send" size={20} color="#002a78" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
