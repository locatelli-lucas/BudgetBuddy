import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import { Toast } from '../../components/ui/Toast';
import { useErrorToast } from '../../contexts/ErrorToastContext';

export function PersonalDataScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const { showError } = useErrorToast();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showError(new Error('Informe seu nome'));
      return;
    }
    setLoading(true);
    try {
      // Send undefined for empty fields so the backend doesn't reject @Email("")
      const cleanEmail = email.trim() || undefined;
      const cleanAvatar = user?.avatarUrl || undefined;
      await authService.updateProfile(name.trim(), cleanEmail, cleanAvatar);
      await refreshUser();
      setToastVisible(true);
      // Navigate back after toast shows briefly
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      showError(err, 'Falha ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <Toast
        visible={toastVisible}
        message="Dados atualizados com sucesso!"
        type="success"
        onHide={() => setToastVisible(false)}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-row items-center justify-between px-5 h-14">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="text-headline-md font-bold text-primary">Dados Pessoais</Text>
          <View className="w-10" />
        </View>

        <View className="flex-1 px-5 pt-6 gap-6">
          <View className="gap-2">
            <Text className="text-label-md text-on-surface">Nome</Text>
            <TextInput
              className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-outline-variant/10"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={Colors.outline}
            />
          </View>
          <View className="gap-2">
            <Text className="text-label-md text-on-surface">Email</Text>
            <TextInput
              className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-outline-variant/10"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={Colors.outline}
              keyboardType="email-address"
              autoCapitalize="none"
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
                <MaterialIcons name="check-circle" size={24} color={Colors.onPrimaryContainer} />
                <Text className="text-body-md text-on-primary-container font-bold">Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
