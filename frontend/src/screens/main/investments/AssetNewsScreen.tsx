import { useErrorToast } from '../../../contexts/ErrorToastContext';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';
import { NewsArticle } from '../../../types/investment';

export function AssetNewsScreen({ route, navigation }: any) {
  const { showError } = useErrorToast();
  const { symbol } = route.params;
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNews = useCallback(async () => {
    try {
      // Assuming investmentService has a getAssetNews method
      // If not, we'd implement it
      // const data = await investmentService.getAssetNews(symbol);
      // setNews(data);
    } catch (err) {
      showError(err, 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center px-5 h-14 border-b border-outline-variant/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-headline-md font-bold text-primary ml-2">Notícias: {symbol}</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-surface rounded-xl p-4 mb-4 border border-outline-variant/10"
              onPress={() => item.url && Linking.openURL(item.url)}
            >
              <Text className="text-body-md font-bold text-on-surface mb-2">{item.title}</Text>
              <Text className="text-label-sm text-on-surface-variant mb-2" numberOfLines={3}>{item.description}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-[10px] text-primary font-bold">{item.source}</Text>
                <Text className="text-[10px] text-on-surface-variant">{item.publishedAt}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <MaterialIcons name="article" size={64} color={Colors.onSurfaceVariant} />
              <Text className="text-on-surface-variant text-body-md mt-4">Nenhuma notícia encontrada para {symbol}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
