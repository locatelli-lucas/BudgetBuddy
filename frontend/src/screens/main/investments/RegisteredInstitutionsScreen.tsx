import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';
import { Institution } from '../../../types/investment';

export function RegisteredInstitutionsScreen({ navigation }: any) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadInstitutions = useCallback(async () => {
    try {
      const data = await investmentService.getInstitutions();
      setInstitutions(data);
    } catch (err) {
      console.error('Failed to load registered brokers', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInstitutions();
  }, [loadInstitutions]);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Informe o nome da instituição');
      return;
    }
    setSubmitting(true);
    try {
      await investmentService.createInstitution({ name: name.trim() });
      setName('');
      await loadInstitutions();
    } catch (err) {
      Alert.alert('Erro', 'Falha ao registrar corretora');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Confirmação', 'Remover esta corretora?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await investmentService.deleteInstitution(id);
            await loadInstitutions();
          } catch (err) {
            Alert.alert('Erro', 'Esta corretora possui ativos associados e não pode ser removida');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 h-14 border-b border-outline-variant/20">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Corretoras</Text>
        </View>
      </View>

      <FlatList
        data={institutions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-body-md text-on-surface-variant mb-4">
              Cadastre suas contas e corretoras ativas para associar aos seus investimentos.
            </Text>
            {/* Form to add */}
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-[#1E293B] border border-outline-variant rounded-xl py-3 px-4 text-on-surface font-body-md"
                placeholder="Ex: XP Investimentos, BTG"
                placeholderTextColor={Colors.outline}
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity
                disabled={submitting}
                onPress={handleAdd}
                className="bg-primary-container px-4 rounded-xl items-center justify-center"
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.onPrimaryContainer} />
                ) : (
                  <MaterialIcons name="add" size={24} color={Colors.onPrimaryContainer} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="bg-surface-container-low rounded-xl p-4 flex-row items-center justify-between mb-3 border border-outline-variant/10">
            <View className="flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center">
                <MaterialIcons name="account-balance" size={24} color={Colors.primary} />
              </View>
              <View>
                <Text className="font-label-md font-semibold text-on-surface">{item.name}</Text>
                {item.brokerCode && <Text className="font-label-sm text-on-surface-variant">Código: {item.brokerCode}</Text>}
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
              <MaterialIcons name="delete" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="py-10 items-center">
              <Text className="text-on-surface-variant text-body-md">Nenhuma corretora cadastrada</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
