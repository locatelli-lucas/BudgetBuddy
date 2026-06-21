import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { TwoFactorSetupResponse } from '../../types/auth';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { Toast } from '../../components/ui/Toast';

export function TwoStepAuthScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(user?.twoFactorEnabled || false);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const data = await authService.setup2FA();
      setSetupData(data);
    } catch (err) {
      showError(err, 'Falha ao configurar 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (!code || code.length < 6) {
      showError(new Error('Digite o código de 6 dígitos do seu aplicativo autenticador'));
      return;
    }
    setLoading(true);
    try {
      await authService.enable2FA(code);
      await refreshUser();
      setEnabled(true);
      setSetupData(null);
      setCode('');
      setToastVisible(true);
    } catch (err) {
      showError(err, 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = () => {
    Alert.alert('Desativar 2FA', 'Digite o código do seu aplicativo autenticador para desativar.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await authService.disable2FA(code);
            await refreshUser();
            setEnabled(false);
            setCode('');
            setToastVisible(true);
          } catch (err) {
            showError(err, 'Código inválido');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <Toast visible={toastVisible} message="Operação realizada com sucesso!" type="success" onHide={() => setToastVisible(false)} />
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Verificação em Duas Etapas</Text>
        <View className="w-10" />
      </View>

      <View className="px-5 pt-6 gap-4">
        <Text className="text-body-md text-on-surface-variant">
          Adicione uma camada extra de segurança à sua conta. Use um aplicativo autenticador como Google
          Authenticator ou Authy para gerar códigos de verificação.
        </Text>

        {!enabled && !setupData && (
          <TouchableOpacity
            className="bg-primary-container rounded-xl py-4 items-center"
            onPress={handleSetup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimaryContainer} />
            ) : (
              <Text className="text-body-md text-on-primary-container font-bold">Configurar 2FA</Text>
            )}
          </TouchableOpacity>
        )}

        {setupData && (
          <View className="gap-4">
            <View className="bg-surface rounded-xl p-4 border border-outline-variant/10 items-center">
              <Text className="text-label-md text-on-surface-variant mb-2">
                Escaneie o QR code com seu aplicativo autenticador:
              </Text>
              <Text className="text-body-md text-on-surface bg-surface-container rounded-lg p-3 font-mono mb-2">
                Chave: {setupData.secret}
              </Text>
              <Text className="text-label-sm text-on-surface-variant">
                Ou insira a chave manualmente no aplicativo.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Código de Verificação</Text>
              <TextInput
                className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface text-center text-2xl tracking-widest border border-outline-variant/10"
                placeholder="000000"
                placeholderTextColor={Colors.outline}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
            </View>

            <TouchableOpacity
              className="bg-primary-container rounded-xl py-4 items-center"
              onPress={handleEnable}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.onPrimaryContainer} />
              ) : (
                <Text className="text-body-md text-on-primary-container font-bold">Ativar 2FA</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {enabled && (
          <View className="gap-4">
            <View className="bg-surface rounded-xl p-4 border border-outline-variant/10 items-center gap-2">
              <View className="w-12 h-12 rounded-full bg-green-500/20 items-center justify-center">
                <MaterialIcons name="check-circle" size={32} color="#22C55E" />
              </View>
              <Text className="text-body-lg font-semibold text-on-surface">2FA Ativado</Text>
              <Text className="text-label-sm text-on-surface-variant text-center">
                Sua conta está protegida com autenticação em duas etapas.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-label-md text-on-surface">Código para Desativar</Text>
              <TextInput
                className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface text-center text-2xl tracking-widest border border-outline-variant/10"
                placeholder="000000"
                placeholderTextColor={Colors.outline}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
            </View>

            <TouchableOpacity
              className="bg-error-container rounded-xl py-4 items-center"
              onPress={handleDisable}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.onError} />
              ) : (
                <Text className="text-body-md text-on-error-container font-bold">Desativar 2FA</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
