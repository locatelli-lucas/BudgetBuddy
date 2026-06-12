import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { useErrorToast } from '../../contexts/ErrorToastContext';
import { authService } from '../../services/auth.service';

export function DeleteAccountConfirmScreen({ navigation }: any) {
  const { showError } = useErrorToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      showError(new Error('Digite sua senha para confirmar'));
      return;
    }

    setLoading(true);
    try {
      await authService.deleteAccount(password);
      // Navigate to confirmation screen. Don't call signOut here —
      // it would unmount MainNavigator before the navigation completes.
      // The DeletedAccount screen's "Voltar ao Início" button calls signOut.
      navigation.reset({ index: 0, routes: [{ name: 'DeletedAccount' }] });
    } catch (err) {
      showError(err, 'Falha ao excluir conta');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-error">Confirmar Exclusão</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 px-5 pt-8 gap-6">
        <Text className="text-body-md text-on-surface-variant text-center">
          Para confirmar, digite sua senha atual:
        </Text>

        <View className="gap-2">
          <Text className="text-label-md text-on-surface">Senha</Text>
          <TextInput
            className="bg-surface rounded-xl py-3 px-4 text-body-md text-on-surface border border-error/30"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            placeholderTextColor={Colors.outline}
          />
        </View>
      </View>

      <View className="px-5 py-4 bg-surface border-t border-surface-container-highest gap-3">
        <TouchableOpacity
          className="w-full h-14 bg-error rounded-xl items-center justify-center"
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-on-error font-bold text-label-md">Excluir Permanentemente</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full h-14 rounded-xl items-center justify-center border border-outline-variant"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-on-surface text-label-md">Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
