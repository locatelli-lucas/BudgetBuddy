import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { authService } from '../../services/auth.service';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { Toast } from '../../components/ui/Toast';

export function UpdatePasswordScreen({ navigation }: any) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const { showError } = useErrorToast();

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError(new Error('Preencha todos os campos'));
      return;
    }
    if (newPassword.length < 6) {
      showError(new Error('A nova senha deve ter pelo menos 6 caracteres'));
      return;
    }
    if (newPassword !== confirmPassword) {
      showError(new Error('As senhas não coincidem'));
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setToastVisible(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao alterar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Toast
        visible={toastVisible}
        message="Senha alterada com sucesso!"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row items-center justify-between px-5 h-14">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Alterar Senha</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 px-5 pt-6 gap-6">
          <View className="gap-2">
            <Text className="text-label-md text-on-surface">Senha Atual</Text>
            <TextInput
              className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-outline-variant/10"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor={Colors.outline}
            />
          </View>
          <View className="gap-2">
            <Text className="text-label-md text-on-surface">Nova Senha</Text>
            <TextInput
              className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-outline-variant/10"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.outline}
            />
          </View>
          <View className="gap-2">
            <Text className="text-label-md text-on-surface">Confirmar Nova Senha</Text>
            <TextInput
              className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-outline-variant/10"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a nova senha"
              placeholderTextColor={Colors.outline}
            />
          </View>
        </View>

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
                <MaterialIcons name="lock" size={24} color={Colors.onPrimaryContainer} />
                <Text className="text-body-md text-on-primary-container font-bold">Alterar Senha</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
