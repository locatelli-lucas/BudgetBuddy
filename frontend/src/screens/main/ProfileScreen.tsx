import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* TopAppBar */}
      <View className="px-5 py-4 flex-row justify-between items-center z-50">
        <Text className="text-on-surface text-headline-lg font-bold">Perfil</Text>
        <TouchableOpacity className="p-2 rounded-full hover:bg-surface-container-high">
          <MaterialIcons name="settings" size={24} color="#e1e2ed" />
        </TouchableOpacity>
      </View>

      <View className="px-5 pt-4 items-center">
        <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
          <Image 
            source={{ uri: user?.profilePictureUrl || 'https://via.placeholder.com/150' }}
            className="w-full h-full"
          />
        </View>
        <Text className="text-on-surface text-headline-md font-bold">{user?.name || 'Lucas'}</Text>
        <Text className="text-on-surface-variant text-body-md mb-8">{user?.email || 'lucas@example.com'}</Text>

        <View className="w-full bg-surface rounded-2xl overflow-hidden shadow-sm mb-6">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-outline-variant/10">
            <MaterialIcons name="account-circle" size={24} color="#b4c5ff" className="mr-4" />
            <Text className="text-on-surface text-body-lg flex-1">Dados Pessoais</Text>
            <MaterialIcons name="chevron-right" size={24} color="#c3c6d7" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-outline-variant/10">
            <MaterialIcons name="security" size={24} color="#b4c5ff" className="mr-4" />
            <Text className="text-on-surface text-body-lg flex-1">Segurança</Text>
            <MaterialIcons name="chevron-right" size={24} color="#c3c6d7" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-outline-variant/10">
            <MaterialIcons name="notifications" size={24} color="#b4c5ff" className="mr-4" />
            <Text className="text-on-surface text-body-lg flex-1">Notificações</Text>
            <MaterialIcons name="chevron-right" size={24} color="#c3c6d7" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-outline-variant/10">
            <MaterialIcons name="star" size={24} color="#F59E0B" className="mr-4" />
            <Text className="text-on-surface text-body-lg flex-1">Assinatura Premium</Text>
            <MaterialIcons name="chevron-right" size={24} color="#c3c6d7" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="w-full h-14 bg-error-container rounded-xl flex-row items-center justify-center shadow-sm"
          onPress={signOut}
        >
          <MaterialIcons name="logout" size={24} color="#ffdad6" className="mr-2" />
          <Text className="text-on-error-container font-bold text-label-md ml-2">Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
