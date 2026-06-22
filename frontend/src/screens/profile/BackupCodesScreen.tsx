import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import * as Clipboard from 'expo-clipboard';

export function BackupCodesScreen({ route, navigation }: any) {
  const { codes } = route.params;

  const handleCopyAll = async () => {
    await Clipboard.setStringAsync(codes.join('\n'));
    Alert.alert('Sucesso', 'Códigos copiados para a área de transferência');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.navigate('Security')} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="close" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Códigos de Backup</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        <View className="bg-warning-container/20 p-4 rounded-xl mb-6 border border-warning/20">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="warning" size={20} color="#EAB308" />
            <Text className="text-body-md font-bold text-on-surface ml-2">Importante</Text>
          </View>
          <Text className="text-body-sm text-on-surface-variant">
            Guarde estes códigos em um lugar seguro. Eles são a única forma de acessar sua conta se você perder seu celular ou o aplicativo autenticador.
          </Text>
          <Text className="text-body-sm text-on-surface-variant font-bold mt-2">
            Cada código só pode ser usado uma vez.
          </Text>
        </View>

        <View className="bg-surface rounded-2xl p-6 border border-outline-variant/10 shadow-sm">
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {codes.map((code: string, index: number) => (
              <View key={index} className="w-[48%] bg-surface-container rounded-lg p-3 items-center border border-outline-variant/5">
                <Text className="text-body-lg font-mono font-bold text-on-surface">{code}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center mt-8 flex-row justify-center"
          onPress={handleCopyAll}
        >
          <MaterialIcons name="content-copy" size={20} color={Colors.onPrimary} className="mr-2" />
          <Text className="text-body-md text-on-primary font-bold ml-2">Copiar Tudo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-primary rounded-xl py-4 items-center mt-4"
          onPress={() => navigation.navigate('Security')}
        >
          <Text className="text-body-md text-primary font-bold">Concluído</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
