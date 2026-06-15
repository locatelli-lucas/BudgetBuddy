import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const { showError } = useErrorToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      showError(new Error('Preencha todos os campos'));
      return;
    }

    setLoading(true);
    try {
      await signUp(name, email, password);
    } catch (error) {
      showError(error, 'Falha ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-container absolute top-4 left-4 z-10"
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#e1e2ed" />
        </TouchableOpacity>

        <View className="mb-10 mt-12">
          <Text className="text-on-surface text-headline-lg font-bold">Criar Conta</Text>
          <Text className="text-on-surface-variant text-body-lg mt-2">
            Comece a controlar suas finanças hoje.
          </Text>
        </View>
        
        <View className="space-y-4 mb-8">
          <View className="bg-surface-container h-14 rounded-xl flex-row items-center px-4 border border-transparent focus-within:border-primary-container">
            <MaterialIcons name="person" size={20} color="#8d90a0" className="mr-3" />
            <TextInput
              className="flex-1 text-on-surface font-body-md"
              placeholder="Nome completo"
              placeholderTextColor="#8d90a0"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="bg-surface-container h-14 rounded-xl flex-row items-center px-4 border border-transparent focus-within:border-primary-container">
            <MaterialIcons name="email" size={20} color="#8d90a0" className="mr-3" />
            <TextInput
              className="flex-1 text-on-surface font-body-md"
              placeholder="E-mail"
              placeholderTextColor="#8d90a0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="bg-surface-container h-14 rounded-xl flex-row items-center px-4 border border-transparent focus-within:border-primary-container">
            <MaterialIcons name="lock" size={20} color="#8d90a0" className="mr-3" />
            <TextInput
              className="flex-1 text-on-surface font-body-md"
              placeholder="Senha"
              placeholderTextColor="#8d90a0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        <TouchableOpacity 
          className="w-full h-14 bg-primary rounded-xl items-center justify-center shadow-lg"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#002a78" />
          ) : (
            <Text className="text-on-primary font-bold text-label-md">Registrar</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-on-surface-variant text-label-md mr-2">Já tenho uma conta.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-primary text-label-md font-bold">Fazer login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
