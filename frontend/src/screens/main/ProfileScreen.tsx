import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';

export function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* TopAppBar */}
      <View className="px-5 py-4 flex-row justify-between items-center z-50">
        <Text className="text-on-surface text-headline-lg font-bold">Perfil</Text>
        <TouchableOpacity
          className="p-2 rounded-full"
          onPress={() => navigation.navigate('Appearance')}
        >
          <MaterialIcons name="palette" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-4 items-center">
        <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-primary/20 items-center justify-center">
              <MaterialIcons name="person" size={48} color={Colors.primary} />
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-on-surface text-headline-md font-bold">{user?.name || 'Usuário'}</Text>
          {user?.premium && (
            <View className="bg-amber-500/20 px-2 py-0.5 rounded-full">
              <Text className="text-amber-400 text-label-xs font-bold">PREMIUM</Text>
            </View>
          )}
        </View>
        <Text className="text-on-surface-variant text-body-md mb-8">{user?.email || ''}</Text>

        {/* Settings Group: Conta */}
        <Text className="text-label-sm text-on-surface-variant uppercase tracking-wider self-start mb-2 ml-1">
          Conta
        </Text>
        <View className="w-full bg-surface rounded-2xl overflow-hidden shadow-sm mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-outline-variant/10"
            onPress={() => navigation.navigate('PersonalData')}
          >
            <MaterialIcons name="account-circle" size={24} color={Colors.primary} style={{ marginRight: 16 }} />
            <Text className="text-on-surface text-body-lg flex-1">Dados Pessoais</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() => navigation.navigate('Security')}
          >
            <MaterialIcons name="security" size={24} color={Colors.primary} style={{ marginRight: 16 }} />
            <Text className="text-on-surface text-body-lg flex-1">Segurança</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Settings Group: Preferências */}
        <Text className="text-label-sm text-on-surface-variant uppercase tracking-wider self-start mb-2 ml-1">
          Preferências
        </Text>
        <View className="w-full bg-surface rounded-2xl overflow-hidden shadow-sm mb-4">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-outline-variant/10"
            onPress={() => navigation.navigate('NotificationOptions')}
          >
            <MaterialIcons name="notifications" size={24} color={Colors.primary} style={{ marginRight: 16 }} />
            <Text className="text-on-surface text-body-lg flex-1">Notificações</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() => navigation.navigate('Appearance')}
          >
            <MaterialIcons name="palette" size={24} color={Colors.primary} style={{ marginRight: 16 }} />
            <Text className="text-on-surface text-body-lg flex-1">Aparência</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Settings Group: Outros */}
        <Text className="text-label-sm text-on-surface-variant uppercase tracking-wider self-start mb-2 ml-1">
          Outros
        </Text>
        <View className="w-full bg-surface rounded-2xl overflow-hidden shadow-sm mb-6">
          <TouchableOpacity
            className="flex-row items-center p-4 border-b border-outline-variant/10"
            onPress={() => navigation.navigate('LeaveAccount')}
          >
            <MaterialIcons name="logout" size={24} color={Colors.error} style={{ marginRight: 16 }} />
            <Text className="text-error text-body-lg flex-1">Sair da Conta</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center p-4"
            onPress={() => navigation.navigate('DeleteAccount')}
          >
            <MaterialIcons name="delete-forever" size={24} color={Colors.error} style={{ marginRight: 16 }} />
            <Text className="text-error text-body-lg flex-1">Excluir Conta</Text>
            <MaterialIcons name="chevron-right" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <Text className="text-label-sm text-on-surface-variant mb-8">BudgetBuddy v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}
