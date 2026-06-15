import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { transactionService } from '../../../services/transaction.service';
import { CategoryType } from '../../../types/transaction';
import { useErrorToast } from '../../../contexts/ErrorToastContext';
import { Toast } from '../../../components/ui/Toast';

const CATEGORY_TYPES: { key: CategoryType; label: string }[] = [
  { key: 'EXPENSE', label: 'Despesa' },
  { key: 'INCOME', label: 'Receita' },
  { key: 'BOTH', label: 'Ambos' },
];

const COLOR_OPTIONS = [
  '#2563EB', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
];

export function AddCategoryScreen({ navigation, route }: any) {
  const params = route.params || {};
  const editId = params.categoryId;
  const isEditing = !!editId;

  const [name, setName] = useState(params.categoryName || '');
  const [selectedIcon, setSelectedIcon] = useState(params.categoryIcon || 'category');
  const [selectedColor, setSelectedColor] = useState(params.categoryColor || COLOR_OPTIONS[0]);
  const [selectedType, setSelectedType] = useState<CategoryType>(params.categoryType || 'EXPENSE');
  const [loading, setLoading] = useState(false);
  const [showIconGallery, setShowIconGallery] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const handleSave = async () => {
    if (!name.trim()) {
      showError(new Error('Informe um nome para a categoria'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: selectedType,
      };

      if (isEditing) {
        await transactionService.updateCategory(editId, payload as any);
      } else {
        await transactionService.createCategory(payload as any);
      }

      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao salvar categoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Toast visible={toastVisible} message={isEditing ? 'Categoria atualizada!' : 'Categoria criada!'} type="success" onHide={() => setToastVisible(false)} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row items-center justify-between px-5 h-14">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Icon Preview + Selector */}
          <TouchableOpacity
            className="items-center mb-6"
            onPress={() => setShowIconGallery(!showIconGallery)}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: `${selectedColor}20` }}
            >
              <MaterialIcons name={selectedIcon as any} size={36} color={selectedColor} />
            </View>
            <Text className="text-label-md text-primary">Trocar ícone</Text>
          </TouchableOpacity>

          {showIconGallery && (
            <View className="bg-surface rounded-xl p-4 mb-6 border border-outline-variant/10">
              <Text className="text-label-md text-on-surface-variant mb-3">Escolha um ícone</Text>
              {/* Selected icon is set via IconGalleryScreen navigation in real flow;
                  for quick pick, show a small set of common icons */}
              <View className="flex-row flex-wrap gap-2">
                {[
                  'home', 'restaurant', 'local-gas-station', 'shopping-cart',
                  'directions-car', 'local-hospital', 'school', 'flight',
                  'pets', 'fitness-center', 'movie', 'music-note',
                  'phone', 'laptop', 'shopping-bag', 'card-giftcard',
                  'category', 'more-horiz',
                ].map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      selectedIcon === icon ? 'bg-primary/20' : 'bg-surface-container'
                    }`}
                    onPress={() => {
                      setSelectedIcon(icon);
                      setShowIconGallery(false);
                    }}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={20}
                      color={selectedIcon === icon ? Colors.primary : Colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                className="mt-3 py-2 items-center"
                onPress={() => navigation.navigate('IconGallery', {
                  onSelect: (icon: string) => {
                    setSelectedIcon(icon);
                    setShowIconGallery(false);
                  },
                })}
              >
                <Text className="text-label-md text-primary">Ver todos os ícones →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Name Input */}
          <View className="gap-2 mb-6">
            <Text className="text-label-md text-on-surface">Nome</Text>
            <TextInput
              className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-outline-variant/10"
              placeholder="Ex: Alimentação"
              placeholderTextColor={Colors.outline}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Type Selector */}
          <View className="gap-2 mb-6">
            <Text className="text-label-md text-on-surface">Tipo</Text>
            <View className="flex-row gap-2">
              {CATEGORY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    selectedType === type.key
                      ? 'bg-primary-container'
                      : 'bg-surface border border-outline-variant/10'
                  }`}
                  onPress={() => setSelectedType(type.key)}
                >
                  <Text
                    className={`font-label-md ${
                      selectedType === type.key ? 'text-on-primary-container' : 'text-on-surface'
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Picker */}
          <View className="gap-2 mb-6">
            <Text className="text-label-md text-on-surface">Cor</Text>
            <View className="flex-row flex-wrap gap-3">
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    selectedColor === color ? 'border-2 border-on-surface' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <MaterialIcons name="check" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
          <TouchableOpacity
            className="w-full h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={24} color={Colors.onPrimaryContainer} />
                <Text className="text-body-md text-on-primary-container font-bold">
                  {isEditing ? 'Atualizar' : 'Salvar Categoria'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
