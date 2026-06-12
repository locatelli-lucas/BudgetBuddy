import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { transactionService } from '../../../services/transaction.service';
import { Category } from '../../../types/transaction';

export function ManageCategoriesScreen({ navigation }: any) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await transactionService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) {
      Alert.alert('Erro', 'Categorias padrão não podem ser removidas');
      return;
    }
    Alert.alert('Confirmação', `Remover a categoria "${cat.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await transactionService.deleteCategory(cat.id);
            setCategories((prev) => prev.filter((c) => c.id !== cat.id));
          } catch (err) {
            Alert.alert('Erro', 'Falha ao remover categoria');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Categorias</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddCategory')}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <MaterialIcons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-surface rounded-xl p-4 flex-row items-center gap-4 mb-3 border border-outline-variant/10"
              onPress={() =>
                navigation.navigate('AddCategory', {
                  categoryId: item.id,
                  categoryName: item.name,
                  categoryIcon: item.icon,
                  categoryColor: item.color,
                  categoryType: item.type,
                })
              }
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: item.color ? `${item.color}20` : `${Colors.primary}20` }}
              >
                <MaterialIcons
                  name={(item.icon || 'help-outline') as any}
                  size={20}
                  color={item.color || Colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-body-md font-semibold text-on-surface">{item.name}</Text>
                <Text className="text-label-sm text-on-surface-variant">
                  {item.type === 'INCOME' ? 'Receita' : item.type === 'EXPENSE' ? 'Despesa' : 'Ambos'}
                  {item.isDefault ? ' · Padrão' : ''}
                </Text>
              </View>
              {!item.isDefault && (
                <TouchableOpacity onPress={() => handleDelete(item)} className="p-2">
                  <MaterialIcons name="delete" size={20} color={Colors.error} />
                </TouchableOpacity>
              )}
              <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Text className="text-on-surface-variant text-body-md">Nenhuma categoria encontrada</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
