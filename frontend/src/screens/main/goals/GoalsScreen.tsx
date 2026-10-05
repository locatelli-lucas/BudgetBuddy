import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, FlatList
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { goalService } from '../../../services/goal.service';
import { Goal } from '../../../types/goal';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { formatCurrency } from '../../../utils/currency';
import { formatSmartDate } from '../../../utils/dates';
import { useFocusEffect } from '@react-navigation/native';

export function GoalsScreen({ navigation }: any) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showError } = useErrorToast();

  const loadGoals = useCallback(async () => {
    try {
      const data = await goalService.getGoals();
      setGoals(data);
    } catch (err) {
      showError(err, 'Falha ao carregar metas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    return (
      <TouchableOpacity
        className="bg-surface-variant rounded-3xl p-5 mb-4 border border-outline-variant/10 shadow-sm"
        onPress={() => navigation.navigate('GoalForm', { goal: item })}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: item.color ? `${item.color}20` : `${Colors.primary}20` }}
            >
              <MaterialIcons
                name={(item.icon || 'star') as any}
                size={24}
                color={item.color || Colors.primary}
              />
            </View>
            <View>
              <Text className="text-title-md font-bold text-on-surface">{item.name}</Text>
              {item.deadline && (
                <Text className="text-label-sm text-on-surface-variant">
                  Meta para {formatSmartDate(item.deadline)}
                </Text>
              )}
            </View>
          </View>
          {item.isCompleted && (
            <View className="bg-success/20 px-2 py-1 rounded-full">
              <Text className="text-[10px] font-bold text-success">CONCLUÍDA</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between items-end mb-2">
          <View>
            <Text className="text-label-sm text-on-surface-variant">Progresso</Text>
            <Text className="text-body-lg font-bold text-on-surface">
              {formatCurrency(item.currentAmount)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-label-sm text-on-surface-variant">Objetivo</Text>
            <Text className="text-body-md font-semibold text-on-surface-variant">
              {formatCurrency(item.targetAmount)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-surface-container rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(item.progressPercent, 100)}%`,
              backgroundColor: item.isCompleted ? '#10b981' : (item.color || Colors.primary)
            }}
          />
        </View>
        <Text className="text-[10px] text-right text-on-surface-variant mt-1 font-bold">
          {item.progressPercent.toFixed(1)}%
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-headline-sm font-bold text-on-surface">Metas Financeiras</Text>
            <Text className="text-label-md text-on-surface-variant">Transforme sonhos em realidade</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={renderGoal}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View className="py-20 items-center">
            <MaterialIcons name="flag" size={64} color={Colors.outline} />
            <Text className="text-body-lg text-on-surface-variant mt-4 text-center">
              Você ainda não tem metas criadas.{"\n"}Que tal começar agora?
            </Text>
            <TouchableOpacity
              className="mt-6 bg-primary px-6 py-3 rounded-2xl"
              onPress={() => navigation.navigate('GoalForm')}
            >
              <Text className="text-white font-bold">Criar Minha Primeira Meta</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute right-6 bottom-6 w-16 h-16 rounded-3xl bg-primary items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('GoalForm')}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
