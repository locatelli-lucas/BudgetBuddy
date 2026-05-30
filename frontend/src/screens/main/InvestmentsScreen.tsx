import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export function InvestmentsScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* TopAppBar */}
      <View className="px-5 py-4 flex-row justify-between items-center z-50 bg-surface">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
            <Image 
              source={{ uri: user?.profilePictureUrl || 'https://via.placeholder.com/150' }}
              className="w-full h-full"
            />
          </View>
          <View>
            <Text className="text-primary text-headline-md font-bold">Investimentos</Text>
            <Text className="text-on-surface-variant text-label-sm">Acompanhe seu patrimônio</Text>
          </View>
        </View>
        <TouchableOpacity className="p-2 rounded-full hover:bg-surface-container-high">
          <MaterialIcons name="search" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-6 pb-32" showsVerticalScrollIndicator={false}>
        {/* Portfolio Value Card */}
        <View className="bg-surface rounded-2xl p-6 shadow-lg mb-6 border border-outline-variant/10">
          <Text className="text-on-surface-variant text-label-md">Patrimônio Total</Text>
          <Text className="text-on-surface text-numeric-display font-medium mt-1">R$ 45.320,00</Text>
          <View className="flex-row items-center gap-1 mt-2">
            <MaterialIcons name="trending-up" size={16} color="#4ade80" />
            <Text className="text-[#4ade80] text-label-md">R$ 350,00 (+0.8%) hoje</Text>
          </View>
        </View>

        {/* Categories Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <TouchableOpacity className="w-[48%] bg-surface-variant rounded-xl p-4 mb-4 border border-outline-variant/10">
            <MaterialIcons name="business" size={24} color="#2563EB" />
            <Text className="text-on-surface font-bold mt-2">Ações</Text>
            <Text className="text-on-surface-variant text-label-sm">R$ 15.000</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-[48%] bg-surface-variant rounded-xl p-4 mb-4 border border-outline-variant/10">
            <MaterialIcons name="home-work" size={24} color="#ffb596" />
            <Text className="text-on-surface font-bold mt-2">FIIs</Text>
            <Text className="text-on-surface-variant text-label-sm">R$ 20.000</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-[48%] bg-surface-variant rounded-xl p-4 mb-4 border border-outline-variant/10">
            <MaterialIcons name="account-balance" size={24} color="#4ade80" />
            <Text className="text-on-surface font-bold mt-2">Renda Fixa</Text>
            <Text className="text-on-surface-variant text-label-sm">R$ 8.000</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-[48%] bg-surface-variant rounded-xl p-4 mb-4 border border-outline-variant/10">
            <MaterialIcons name="language" size={24} color="#b9c7e0" />
            <Text className="text-on-surface font-bold mt-2">Exterior</Text>
            <Text className="text-on-surface-variant text-label-sm">R$ 2.320</Text>
          </TouchableOpacity>
        </View>

        {/* Top Assets */}
        <Text className="text-on-surface text-body-lg font-semibold mb-4">Meus Ativos</Text>
        <View className="bg-surface rounded-xl p-2 shadow-sm mb-24">
          <View className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-surface-container-highest items-center justify-center">
                <Text className="text-on-surface font-bold">ITUB4</Text>
              </View>
              <View>
                <Text className="text-on-surface text-body-md font-medium">Itaú Unibanco</Text>
                <Text className="text-on-surface-variant text-label-sm">Ações • 100 cotas</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-on-surface text-body-md font-medium">R$ 3.450,00</Text>
              <Text className="text-[#4ade80] text-label-sm">+1.2%</Text>
            </View>
          </View>
          <View className="h-[1px] bg-outline-variant/20 mx-4" />
          <View className="flex-row items-center justify-between p-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-surface-container-highest items-center justify-center">
                <Text className="text-on-surface font-bold">MXRF</Text>
              </View>
              <View>
                <Text className="text-on-surface text-body-md font-medium">Maxi Renda FII</Text>
                <Text className="text-on-surface-variant text-label-sm">FIIs • 500 cotas</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-on-surface text-body-md font-medium">R$ 5.300,00</Text>
              <Text className="text-error text-label-sm">-0.5%</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Main Action FAB-like Button */}
      <View className="absolute bottom-[90px] left-5 right-5 z-40">
        <TouchableOpacity className="w-full h-14 bg-primary rounded-xl flex-row items-center justify-center shadow-xl">
          <MaterialIcons name="add-circle" size={24} color="#ffffff" className="mr-2" />
          <Text className="text-on-primary font-bold text-label-md ml-2">Adicionar Investimento</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
