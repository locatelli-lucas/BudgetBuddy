import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export function LoginScreen({ navigation }: any) {
  const { signIn, signInWithGoogle } = useAuth();
  const { showError } = useErrorToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      showError(new Error('Preencha todos os campos'));
      return;
    }
    
    setLoading(true);
    try {
      const data = await signIn(email, password);
      if (data.requires2FA) {
        navigation.navigate('TwoFactorVerification', {
          temporaryToken: data.temporaryToken
        });
      }
    } catch (error) {
      showError(error, 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const data = await signInWithGoogle();
      if (data.requires2FA) {
        navigation.navigate('TwoFactorVerification', {
          temporaryToken: data.temporaryToken
        });
      }
    } catch (error: any) {
      if (error.code !== '7') { // 7 is usually "cancelled by user" in Google Sign-In
        showError(error, 'Falha ao entrar com Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
        style={{ flex: 1 }}
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="account-balance-wallet" size={40} color="#b4c5ff" />
          </View>
          <Text className="text-primary text-display font-bold">BudgetBuddy</Text>
          <Text className="text-on-surface-variant text-body-lg mt-2 text-center">
            Sua vida financeira, simplificada.
          </Text>
        </View>
        
        <View className="gap-4 mb-8">
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
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
              <MaterialIcons
                name={showPassword ? "visibility-off" : "visibility"}
                size={20}
                color="#8d90a0"
              />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity className="items-end">
            <Text className="text-primary text-label-md font-bold">Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="w-full h-14 bg-primary rounded-xl items-center justify-center shadow-lg mb-4"
          onPress={handleLogin}
          disabled={loading || googleLoading}
        >
          {loading ? (
            <ActivityIndicator color="#002a78" />
          ) : (
            <Text className="text-on-primary font-bold text-label-md">Entrar</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center gap-4 mb-4">
          <View className="flex-1 h-[1px] bg-outline-variant/30" />
          <Text className="text-on-surface-variant text-label-sm">OU</Text>
          <View className="flex-1 h-[1px] bg-outline-variant/30" />
        </View>

        <TouchableOpacity
          className="w-full h-14 bg-surface rounded-xl flex-row items-center justify-center border border-outline-variant/50 shadow-sm"
          onPress={handleGoogleLogin}
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
              <Text className="text-on-surface font-bold text-label-md">Continuar com Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center justify-center mt-8">
          <Text className="text-on-surface-variant text-label-md mr-2">Ainda não tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-primary text-label-md font-bold">Criar conta</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
