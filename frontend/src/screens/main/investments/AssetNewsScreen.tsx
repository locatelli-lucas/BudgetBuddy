import { useErrorToast } from '../../../contexts/ErrorToastContext';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { investmentService } from '../../../services/investment.service';
import { NewsArticle } from '../../../types/investment';
import { formatRelativeTime } from '../../../utils/dates';

export function AssetNewsScreen({ route, navigation }: any) {
  const { showError } = useErrorToast();
  const { symbol, name } = route.params;
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await investmentService.getAssetNews(symbol, name);
      setNews(data);
    } catch (err) {
      showError(err, 'Falha ao carregar notícias');
    } finally {
      setLoading(false);
    }
  }, [symbol, showError]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleAiSummary = async () => {
    setSummarizing(true);
    try {
      const data = await investmentService.generateAiNewsSummary(symbol, name);
      setAiSummary(data.summary);
      setShowSummaryModal(true);
    } catch (err) {
      showError(err, 'Falha ao gerar resumo por IA');
    } finally {
      setSummarizing(false);
    }
  };

  const renderItem = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      className="bg-surface-variant rounded-2xl p-4 mb-4 border border-outline-variant/10 shadow-sm"
      onPress={() => item.url && Linking.openURL(item.url)}
    >
      <Text className="text-body-md font-bold text-on-surface mb-2">{item.title}</Text>
      <Text className="text-label-sm text-on-surface-variant mb-3" numberOfLines={3}>
        {item.summary}
      </Text>
      <View className="flex-row justify-between items-center border-t border-outline-variant/10 pt-2">
        <Text className="text-[10px] text-primary font-bold uppercase tracking-wider">{item.source}</Text>
        <Text className="text-[10px] text-on-surface-variant">{formatRelativeTime(item.publishedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']} style={{ flex: 1, backgroundColor: Colors.background }}>
      <View className="flex-row items-center justify-between px-5 h-16 border-b border-outline-variant/10 bg-surface">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
            <MaterialIcons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View className="ml-2">
            <Text className="text-headline-sm font-bold text-primary">Notícias: {symbol || name}</Text>
            <Text className="text-label-sm text-on-surface-variant">Últimas do mercado</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary/10 p-2 rounded-xl flex-row items-center gap-1"
          onPress={handleAiSummary}
          disabled={summarizing || loading}
        >
          {summarizing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
              <Text className="text-primary font-bold text-label-sm">Resumir</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id || item.url}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <View className="py-20 items-center">
              <MaterialIcons name="article" size={64} color={Colors.outline} />
              <Text className="text-on-surface-variant text-body-md mt-4 text-center">
                Nenhuma notícia encontrada para {symbol} no momento.
              </Text>
            </View>
          }
          refreshing={loading}
          onRefresh={loadNews}
        />
      )}

      {/* AI Summary Modal */}
      <Modal
        visible={showSummaryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSummaryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-[32px] p-6 h-[70%]">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
                </View>
                <Text className="text-headline-sm font-bold text-on-surface">Resumo Inteligente</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSummaryModal(false)} className="p-2">
                <MaterialIcons name="close" size={24} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 mb-6" showsVerticalScrollIndicator={false}>
              <Text className="text-body-md text-on-surface leading-6">
                {aiSummary}
              </Text>
              <View className="h-20" />
            </ScrollView>

            <TouchableOpacity
              className="bg-primary h-14 rounded-2xl items-center justify-center"
              onPress={() => setShowSummaryModal(false)}
            >
              <Text className="text-white font-bold text-label-lg">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
