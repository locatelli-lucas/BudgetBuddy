import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export function RegisterScreen({ navigation }: any) {
  const { signUp, signInWithGoogle } = useAuth();
  const { showError } = useErrorToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      showError(new Error('Preencha todos os campos'));
      return;
    }

    if (password !== confirmPassword) {
      showError(new Error('As senhas não coincidem'));
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

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    try {
      const data = await signInWithGoogle();
      if (data.requires2FA) {
        navigation.navigate('TwoFactorVerification', {
          temporaryToken: data.temporaryToken
        });
      }
    } catch (error: any) {
      if (error.code !== '7') {
        showError(error, 'Falha ao entrar com Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center py-10"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-surface-container"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>

          <View className="mb-8">
            <Text className="text-primary text-display font-bold">Criar Conta</Text>
            <Text className="text-on-surface-variant text-body-lg mt-2">
              Comece sua jornada financeira hoje.
            </Text>
          </View>

          <View className="gap-4 mb-8">
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

            <View className="bg-surface-container h-14 rounded-xl flex-row items-center px-4 border border-transparent focus-within:border-primary-container">
              <MaterialIcons name="lock" size={20} color="#8d90a0" className="mr-3" />
              <TextInput
                className="flex-1 text-on-surface font-body-md"
                placeholder="Confirmar Senha"
                placeholderTextColor="#8d90a0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            className="w-full h-14 bg-primary rounded-xl items-center justify-center shadow-lg mb-4"
            onPress={handleRegister}
            disabled={loading || googleLoading}
          >
            {loading ? (
              <ActivityIndicator color="#002a78" />
            ) : (
              <Text className="text-on-primary font-bold text-label-md">Criar conta</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center gap-4 mb-4">
            <View className="flex-1 h-[1px] bg-outline-variant/30" />
            <Text className="text-on-surface-variant text-label-sm">OU</Text>
            <View className="flex-1 h-[1px] bg-outline-variant/30" />
          </View>

          <TouchableOpacity
            className="w-full h-14 bg-surface rounded-xl flex-row items-center justify-center border border-outline-variant/50 shadow-sm"
            onPress={handleGoogleSignUp}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <>
                <Image
                source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }}
                style={{ width: 24, height: 24, marginRight: 12 }}
              />
                <Text className="text-on-surface font-bold text-label-md">Cadastrar com Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-on-surface-variant text-label-md mr-2">Já tem conta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary text-label-md font-bold">Fazer login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
