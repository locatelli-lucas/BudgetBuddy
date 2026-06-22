import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { authService, AuthProviderType } from '../../services/auth.service';
import { useErrorToast } from '../../contexts/ErrorToastContext';

// Import GoogleSignin safely
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  // Silent fail for top level
}

export function ConnectedAccountsScreen({ navigation }: any) {
  const [providers, setProviders] = useState<AuthProviderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showError } = useErrorToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      const data = await authService.getConnectedProviders();
      setProviders(data);
    } catch (error) {
      showError(error, 'Falha ao carregar contas conectadas');
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkGoogle() {
    if (!GoogleSignin) {
      showError(new Error('Google Sign-In não disponível no Expo Go. Use npx expo run:android.'));
      return;
    }

    setActionLoading('GOOGLE');
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.idToken) {
        await authService.linkGoogle(userInfo.idToken);
        await fetchProviders();
        Alert.alert('Sucesso', 'Conta Google conectada com sucesso!');
      }
    } catch (error: any) {
      if (error.code !== '7') {
        showError(error, 'Falha ao conectar conta Google');
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnlinkGoogle() {
    Alert.alert(
      'Desconectar Google',
      'Tem certeza que deseja desconectar sua conta Google? Você precisará de outra forma de login para acessar sua conta.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('GOOGLE_UNLINK');
            try {
              await authService.unlinkGoogle();
              await fetchProviders();
              Alert.alert('Sucesso', 'Conta Google desconectada.');
            } catch (error) {
              showError(error, 'Falha ao desconectar conta Google');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center" style={{ backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isGoogleLinked = providers.includes('GOOGLE');
  const isEmailLinked = providers.includes('EMAIL');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary ml-2">Contas Conectadas</Text>
      </View>

      <View className="px-5 pt-6 gap-6">
        <Text className="text-body-md text-on-surface-variant">
          Gerencie as formas de acesso à sua conta BudgetBuddy.
        </Text>

        <View className="bg-surface rounded-2xl border border-outline-variant/10 overflow-hidden">
          {/* Email Provider */}
          <View className="flex-row items-center justify-between p-4 border-b border-outline-variant/10">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <MaterialIcons name="email" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">E-mail e Senha</Text>
                <Text className="text-label-sm text-on-surface-variant">Tradicional</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              {isEmailLinked ? (
                <View className="bg-green-500/10 px-3 py-1 rounded-full">
                  <Text className="text-green-600 text-label-sm font-bold">Conectado</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate('UpdatePassword')}>
                  <Text className="text-primary text-label-md font-bold">Configurar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Google Provider */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center mr-3 border border-outline-variant/10">
                <Image
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                  style={{ width: 20, height: 20 }}
                />
              </View>
              <View>
                <Text className="text-body-lg font-bold text-on-surface">Google</Text>
                <Text className="text-label-sm text-on-surface-variant">Acesso rápido</Text>
              </View>
            </View>
            <View>
              {isGoogleLinked ? (
                <TouchableOpacity
                  onPress={handleUnlinkGoogle}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'GOOGLE_UNLINK' ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <Text className="text-error text-label-md font-bold">Desconectar</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleLinkGoogle}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'GOOGLE' ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text className="text-primary text-label-md font-bold">Conectar</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View className="bg-surface-container/50 p-4 rounded-xl border border-outline-variant/10">
          <View className="flex-row items-start">
            <MaterialIcons name="info" size={20} color={Colors.onSurfaceVariant} className="mt-0.5" />
            <Text className="flex-1 text-label-sm text-on-surface-variant ml-2 leading-5">
              Por segurança, você não pode desconectar todas as formas de login. Sempre mantenha pelo menos uma conta conectada.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
