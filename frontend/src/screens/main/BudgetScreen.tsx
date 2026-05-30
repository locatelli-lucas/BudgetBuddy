import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CategoryProgress } from '../../components/CategoryProgress';

export function BudgetScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      {/* Top App Bar */}
      <View 
        className="flex-row justify-between items-center px-5 h-16 bg-surface z-50"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-headline-md font-bold text-on-surface">Orçamentos</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full">
          <MaterialIcons name="calendar-month" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Monthly Selector */}
        <View className="flex-row items-center justify-between mb-8 bg-surface-variant/30 rounded-xl p-2">
          <TouchableOpacity className="p-2">
            <MaterialIcons name="chevron-left" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <Text className="text-label-md font-bold text-on-surface uppercase tracking-wider">
            Maio 2026
          </Text>
          <TouchableOpacity className="p-2">
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Forecast Card */}
        <View className="bg-surface/80 rounded-2xl p-5 flex-row items-start gap-4 border-l-4 border-primary shadow-sm mb-8">
          <MaterialIcons name="info" size={24} color={Colors.primary} style={{ marginTop: 4 }} />
          <Text className="flex-1 text-body-md text-on-surface leading-relaxed">
            No ritmo atual você terminará o mês com{' '}
            <Text className="font-bold text-primary">R$ 1.240</Text> disponíveis.
          </Text>
        </View>

        {/* Budget Cards Section */}
        <View className="flex-col gap-4">
          <CategoryProgress 
            id="1"
            name="Alimentação"
            spent={620}
            limit={800}
            icon="restaurant"
          />
          <CategoryProgress 
            id="2"
            name="Transporte"
            spent={540}
            limit={500}
            icon="directions-car"
          />
          <CategoryProgress 
            id="3"
            name="Saúde"
            spent={280}
            limit={300}
            icon="medical-services"
          />
        </View>
      </ScrollView>

      {/* Main Action FAB-like Button */}
      <View className="absolute bottom-6 w-full px-5">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4.65,
            elevation: 8,
          }}
        >
          <MaterialIcons name="add-circle" size={24} color={Colors.onPrimary} />
          <Text className="text-on-primary font-bold text-label-md">Criar orçamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
