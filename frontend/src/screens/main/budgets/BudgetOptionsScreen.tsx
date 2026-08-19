import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';

export function BudgetOptionsScreen({ navigation, route }: any) {
  const params = route.params || {};
  const { categoryId, categoryName, budgetId } = params;

  const options = [
    {
      icon: 'edit' as const,
      label: 'Editar Limites',
      subtitle: 'Ajuste o valor limite deste orçamento',
      onPress: () =>
        navigation.navigate('DefineLimit', { budgetId, categoryId, categoryName }),
    },
    {
      icon: 'history' as const,
      label: 'Ver Histórico',
      subtitle: 'Visualize meses anteriores desta categoria',
      onPress: () => navigation.navigate('BudgetHistory'),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Opções</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 pt-4 gap-2">
        {options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            className="bg-surface rounded-xl p-4 flex-row items-center gap-4 border border-outline-variant/10"
            onPress={opt.onPress}
          >
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <MaterialIcons name={opt.icon} size={22} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-body-md font-semibold text-on-surface">{opt.label}</Text>
              <Text className="text-label-sm text-on-surface-variant">{opt.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
