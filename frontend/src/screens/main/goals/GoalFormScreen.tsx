import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { goalService } from '../../../services/goal.service';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '../../../utils/currency';

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const PRESET_ICONS = ['star', 'flag', 'home', 'directions-car', 'flight', 'school', 'favorite', 'savings', 'shopping-cart'];

export function GoalFormScreen({ route, navigation }: any) {
  const goal = route.params?.goal;
  const { showError } = useErrorToast();

  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount ? formatCurrencyInput((goal.targetAmount * 100).toFixed(0)) : '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount !== undefined ? formatCurrencyInput((goal.currentAmount * 100).toFixed(0)) : '0,00');
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [color, setColor] = useState(goal?.color || PRESET_COLORS[0]);
  const [icon, setIcon] = useState(goal?.icon || PRESET_ICONS[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !targetAmount) {
      Alert.alert('Erro', 'Por favor, preencha o nome e o valor objetivo.');
      return;
    }

    setLoading(true);
    try {
      const request = {
        name,
        targetAmount: parseCurrencyInput(targetAmount),
        currentAmount: parseCurrencyInput(currentAmount),
        deadline: deadline || undefined,
        color,
        icon
      };

      if (goal) {
        await goalService.updateGoal(goal.id, request);
      } else {
        await goalService.createGoal(request);
      }
      navigation.goBack();
    } catch (err) {
      showError(err, 'Falha ao salvar meta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Excluir Meta', 'Tem certeza que deseja excluir esta meta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await goalService.deleteGoal(goal.id);
            navigation.goBack();
          } catch (err) {
            showError(err, 'Falha ao excluir meta');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-outline-variant/10 bg-surface">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <MaterialIcons name="close" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text className="text-headline-sm font-bold text-on-surface ml-2">
              {goal ? 'Editar Meta' : 'Nova Meta'}
            </Text>
          </View>
          {goal && (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <MaterialIcons name="delete-outline" size={24} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="gap-6">
            <View>
              <Text className="text-label-md text-on-surface-variant mb-2">Qual seu objetivo?</Text>
              <TextInput
                className="bg-surface-variant p-4 rounded-2xl text-on-surface font-body-lg border border-outline-variant/20"
                placeholder="Ex: Viagem para o Japão"
                placeholderTextColor={Colors.outline}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-label-md text-on-surface-variant mb-2">Quanto você precisa?</Text>
                <TextInput
                  className="bg-surface-variant p-4 rounded-2xl text-on-surface font-body-lg border border-outline-variant/20"
                  placeholder="0,00"
                  placeholderTextColor={Colors.outline}
                  keyboardType="numeric"
                  value={targetAmount}
                onChangeText={(text) => setTargetAmount(formatCurrencyInput(text))}
              />
              </View>
              <View className="flex-1">
                <Text className="text-label-md text-on-surface-variant mb-2">Já possui quanto?</Text>
                <TextInput
                  className="bg-surface-variant p-4 rounded-2xl text-on-surface font-body-lg border border-outline-variant/20"
                  placeholder="0,00"
                  placeholderTextColor={Colors.outline}
                  keyboardType="numeric"
                  value={currentAmount}
                onChangeText={(text) => setCurrentAmount(formatCurrencyInput(text))}
              />
              </View>
            </View>

            <View>
              <Text className="text-label-md text-on-surface-variant mb-2">Data Limite (Opcional)</Text>
              <TouchableOpacity
                className="bg-surface-variant p-4 rounded-2xl flex-row justify-between items-center border border-outline-variant/20"
                onPress={() => navigation.navigate('DatePicker', {
                  initialDate: deadline || new Date().toISOString().split('T')[0],
                  onSelect: (date: string) => setDeadline(date)
                })}
              >
                <Text className="text-on-surface font-body-lg">
                  {deadline ? new Date(deadline + 'T00:00:00').toLocaleDateString('pt-BR') : 'Selecionar data'}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-label-md text-on-surface-variant mb-3">Escolha uma Cor</Text>
              <View className="flex-row flex-wrap gap-3">
                {PRESET_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    className={`w-10 h-10 rounded-full items-center justify-center ${color === c ? 'border-2 border-primary' : ''}`}
                    style={{ backgroundColor: c }}
                    onPress={() => setColor(c)}
                  >
                    {color === c && <MaterialIcons name="check" size={20} color="white" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-label-md text-on-surface-variant mb-3">Escolha um Ícone</Text>
              <View className="flex-row flex-wrap gap-3">
                {PRESET_ICONS.map(i => (
                  <TouchableOpacity
                    key={i}
                    className={`w-12 h-12 rounded-2xl items-center justify-center border ${icon === i ? 'bg-primary border-primary' : 'bg-surface-variant border-outline-variant/20'}`}
                    onPress={() => setIcon(i)}
                  >
                    <MaterialIcons name={i as any} size={24} color={icon === i ? 'white' : color} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="p-5 border-t border-outline-variant/10 bg-surface">
          <TouchableOpacity
            className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-label-lg">
                {goal ? 'Salvar Alterações' : 'Criar Meta'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
