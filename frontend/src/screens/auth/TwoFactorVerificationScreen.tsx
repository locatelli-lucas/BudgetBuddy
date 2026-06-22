import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

export function TwoFactorVerificationScreen({ route, navigation }: any) {
  const { temporaryToken } = route.params;
  const { verify2FA } = useAuth();
  const { showError } = useErrorToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (code.length < 6) {
      showError(new Error('Digite o código de verificação'));
      return;
    }

    setLoading(true);
    try {
      await verify2FA(temporaryToken, code);
      // Navigation is handled by AuthContext (isAuthenticated change)
    } catch (error) {
      showError(error, 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-4 left-4 p-2"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
            <MaterialIcons name="security" size={40} color={Colors.primary} />
          </View>
          <Text className="text-primary text-headline-lg font-bold">Verificação em Duas Etapas</Text>
          <Text className="text-on-surface-variant text-body-md mt-4 text-center">
            Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador ou um de seus códigos de backup.
          </Text>
        </View>

        <View className="gap-6 mb-8">
          <View className="bg-surface-container h-16 rounded-xl flex-row items-center px-4 border border-outline-variant/20 focus-within:border-primary">
            <TextInput
              className="flex-1 text-on-surface text-center text-3xl font-bold tracking-widest"
              placeholder="000000"
              placeholderTextColor={Colors.outline}
              keyboardType="number-pad"
              autoCapitalize="none"
              maxLength={8} // Allow for backup codes too
              value={code}
              onChangeText={setCode}
              autoFocus
            />
          </View>
        </View>

        <TouchableOpacity
          className="w-full h-14 bg-primary rounded-xl items-center justify-center shadow-lg"
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text className="text-on-primary font-bold text-label-lg">Verificar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-8">
          <Text className="text-on-surface-variant text-label-md">Não consegue acessar seu app?</Text>
          <Text className="text-primary text-label-md font-bold mt-1">Usar código de recuperação</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
