import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const categories = [
  { key: 'food', icon: 'restaurant', label: 'Alimentação' },
  { key: 'transport', icon: 'directions-car', label: 'Transporte' },
  { key: 'health', icon: 'medical-services', label: 'Saúde' },
  { key: 'bills', icon: 'receipt', label: 'Contas' },
  { key: 'salary', icon: 'payments', label: 'Salário' },
  { key: 'investment', icon: 'trending-up', label: 'Investimento' },
  { key: 'shopping', icon: 'shopping-bag', label: 'Compras' },
  { key: 'other', icon: 'more-horiz', label: 'Outros' },
];

const paymentMethods = [
  { key: 'credit', icon: 'credit-card', label: 'Crédito' },
  { key: 'debit', icon: 'credit-card', label: 'Débito' },
  { key: 'pix', icon: 'pix', label: 'PIX' },
  { key: 'cash', icon: 'payments', label: 'Dinheiro' },
  { key: 'transfer', icon: 'sync-alt', label: 'Transferência' },
];

export function NewTransactionScreen({ navigation }: any) {
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('Hoje, 24 Out');
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || parseFloat(amount.replace(',', '.')) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Erro', 'Informe uma descrição');
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, call the API to save the transaction
      // await transactionService.create({...});
      Alert.alert('Sucesso', 'Transação salva com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch {
      Alert.alert('Erro', 'Falha ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* TopAppBar */}
        <View className="flex-row items-center justify-between px-5 h-14">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Nova transação</Text>
          <View className="w-10" />
        </View>

        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Segmented Toggle */}
          <View className="px-5 mb-6">
            <View className="flex-row bg-surface-container rounded-lg p-1">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${transactionType === 'EXPENSE' ? 'bg-primary-container' : ''}`}
                onPress={() => setTransactionType('EXPENSE')}
              >
                <Text className={`text-center font-label-md ${transactionType === 'EXPENSE' ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                  Despesa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-md ${transactionType === 'INCOME' ? 'bg-primary-container' : ''}`}
                onPress={() => setTransactionType('INCOME')}
              >
                <Text className={`text-center font-label-md ${transactionType === 'INCOME' ? 'text-on-primary-container' : 'text-on-surface-variant'}`}>
                  Receita
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Input */}
          <View className="px-5 mb-6 items-center justify-center">
            <Text className="text-label-md text-on-surface-variant mb-2">Valor</Text>
            <View className="flex-row items-center justify-center w-full">
              <Text className="text-numeric-display text-on-surface-variant mr-2">R$</Text>
              <TextInput
                className="text-numeric-display text-on-background text-center flex-1"
                placeholder="0,00"
                placeholderTextColor={Colors.outline}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          {/* Card Container for Fields */}
          <View className="bg-surface rounded-t-3xl flex-1 px-5 pt-6 pb-6 gap-6">
            {/* Category Selector */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Categoria</Text>
              <View className="flex-row flex-wrap justify-between mt-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    className="items-center gap-2 mb-4"
                    style={{ width: '23%' }}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <View className={`w-14 h-14 rounded-full items-center justify-center ${
                      selectedCategory === cat.key 
                        ? 'bg-primary-container' 
                        : 'bg-surface-container'
                    }`}>
                      <MaterialIcons 
                        name={cat.icon as any} 
                        size={24} 
                        color={selectedCategory === cat.key ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
                      />
                    </View>
                    <Text className={`text-label-sm text-center ${
                      selectedCategory === cat.key ? 'text-on-surface' : 'text-on-surface-variant'
                    }`}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description Input */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Descrição</Text>
              <View className="flex-row items-center bg-surface-container rounded-lg px-4 py-3">
                <MaterialIcons name="edit" size={20} color={Colors.outline} style={{ marginRight: 12 }} />
                <TextInput
                  className="flex-1 text-body-md text-on-surface"
                  placeholder="Ex: Almoço de negócios"
                  placeholderTextColor={Colors.outline}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            {/* Date Picker */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Data</Text>
              <TouchableOpacity className="flex-row items-center justify-between bg-surface-container rounded-lg px-4 py-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="calendar-today" size={20} color={Colors.outline} style={{ marginRight: 12 }} />
                  <Text className="text-body-md text-on-surface">{date}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Método de Pagamento</Text>
              <View className="flex-row flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    className={`py-2 px-4 rounded-full flex-row items-center gap-2 ${
                      paymentMethod === method.key 
                        ? 'bg-primary-container' 
                        : 'bg-surface-container'
                    }`}
                    onPress={() => setPaymentMethod(method.key)}
                  >
                    <MaterialIcons 
                      name={method.icon as any} 
                      size={18} 
                      color={paymentMethod === method.key ? Colors.onPrimaryContainer : Colors.onSurfaceVariant} 
                    />
                    <Text className={`font-label-md ${
                      paymentMethod === method.key ? 'text-on-primary-container' : 'text-on-surface-variant'
                    }`}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recurring Toggle */}
            <View className="flex-row items-center justify-between py-2 border-t border-surface-container-highest mt-2 pt-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center">
                  <MaterialIcons name="repeat" size={20} color={Colors.onSurfaceVariant} />
                </View>
                <Text className="text-body-md text-on-surface">Pagamento recorrente</Text>
              </View>
              <TouchableOpacity
                className={`w-12 h-6 rounded-full relative ${isRecurring ? 'bg-primary-container' : 'bg-surface-container'}`}
                onPress={() => setIsRecurring(!isRecurring)}
              >
                <View className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                  isRecurring ? 'bg-on-primary-container right-1' : 'bg-on-surface-variant left-1'
                }`} />
              </TouchableOpacity>
            </View>

            {/* Notes Textarea */}
            <View className="gap-2 mt-2">
              <Text className="text-label-md text-on-surface">Observações (opcional)</Text>
              <TextInput
                className="bg-surface-container rounded-lg px-4 py-3 text-body-md text-on-surface min-h-[80px]"
                placeholder="Adicione detalhes adicionais aqui..."
                placeholderTextColor={Colors.outline}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="px-5 py-4 bg-surface border-t border-surface-container-highest">
          <TouchableOpacity
            className="w-full h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2 active:scale-[0.98]"
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={24} color={Colors.onPrimaryContainer} />
                <Text className="text-headline-md text-on-primary-container font-bold">
                  Salvar transação
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
