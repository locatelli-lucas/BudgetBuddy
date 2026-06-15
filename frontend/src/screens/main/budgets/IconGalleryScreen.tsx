import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';

const ALL_ICONS: string[] = [
  'home', 'work', 'restaurant', 'local-gas-station', 'shopping-cart',
  'directions-car', 'local-hospital', 'school', 'flight', 'flight-takeoff',
  'pets', 'fitness-center', 'movie', 'music-note', 'sports-esports',
  'phone', 'laptop', 'tv', 'shopping-bag', 'card-giftcard',
  'account-balance', 'credit-card', 'attach-money', 'savings',
  'trending-up', 'trending-down', 'pie-chart', 'bar-chart', 'show-chart',
  'category', 'more-horiz', 'star', 'favorite', 'bookmark',
  'shopping-basket', 'local-grocery-store', 'local-cafe', 'local-bar',
  'fastfood', 'lunch-dining', 'dinner-dining', 'local-pizza',
  'local-pharmacy', 'spa', 'self-improvement', 'child-care', 'elderly',
  'church', 'temple-buddhist', 'park', 'nature-people',
  'directions-bike', 'directions-run', 'pool', 'beach-access',
  'lightbulb', 'emoji-objects', 'insights', 'auto-awesome',
  'build', 'handyman', 'cleaning-services', 'local-laundry-service',
  'directions-bus', 'train', 'directions-subway', 'local-taxi',
  'computer', 'headphones', 'camera', 'videocam',
  'celebration', 'cake', 'wine-bar', 'nightlife',
  'volunteer-activism', 'payments', 'receipt-long', 'currency-exchange',
  'redeem', 'wallet', 'account-balance-wallet',
];

export function IconGalleryScreen({ navigation, route }: any) {
  const [search, setSearch] = useState('');
  const onSelect = route.params?.onSelect;

  const filteredIcons = search
    ? ALL_ICONS.filter((icon) => icon.toLowerCase().includes(search.toLowerCase()))
    : ALL_ICONS;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 h-14">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary">Ícones</Text>
        <View className="w-10" />
      </View>

      {/* Search */}
      <View className="px-5 pb-3">
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-2 border border-outline-variant/10">
          <MaterialIcons name="search" size={20} color={Colors.outline} style={{ marginRight: 8 }} />
          <TextInput
            className="flex-1 text-body-md text-on-surface"
            placeholder="Buscar ícone..."
            placeholderTextColor={Colors.outline}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredIcons}
        keyExtractor={(item) => item}
        numColumns={4}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1 items-center py-3 m-1 rounded-xl bg-surface border border-outline-variant/10"
            onPress={() => {
              if (onSelect) {
                onSelect(item);
              }
              navigation.goBack();
            }}
          >
            <MaterialIcons name={item as any} size={28} color={Colors.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
