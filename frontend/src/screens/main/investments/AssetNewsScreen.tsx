import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  ActivityIndicator, Image, TextInput, RefreshControl, Modal,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';
import { newsService, NewsArticle, NewsAiSummary } from '../../../services/news.service';

type DateFilter = 'ANY' | '24H' | '7D' | '30D';
type SortOrder = 'NEWEST' | 'OLDEST';

export function AssetNewsScreen({ navigation, route }: any) {
  const symbolParam = route.params?.symbol?.split('.')[0];
  const nameParam = route.params?.name;

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(symbolParam || '');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ANY');
  const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<NewsAiSummary | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);

  const loadNews = useCallback(async (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }
    setLoading(true);
    try {
      const data = await newsService.getAssetNews(query.toUpperCase());
      setArticles(data);
    } catch (err) {
      console.error('Failed to load news', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (symbolParam) {
      loadNews(symbolParam);
    }
  }, [symbolParam, loadNews]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews(searchQuery);
  };

  const handleSearchSubmit = () => {
    loadNews(searchQuery);
  };

  const handleGenerateSummary = async () => {
    if (!searchQuery.trim()) return;
    setGeneratingSummary(true);
    try {
      const summary = await newsService.getAssetSummary(searchQuery.toUpperCase());
      setAiSummary(summary);
      setSummaryModalVisible(true);
    } catch (err) {
      console.error('Failed to generate summary', err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleShareSummary = async () => {
    if (!aiSummary) return;
    const displayName = nameParam || searchQuery.toUpperCase();
    const message = `Resumo AI - ${displayName}\n\n` +
      `Sentimento: ${aiSummary.sentiment}\n\n` +
      `Principais Desenvolvimentos:\n${aiSummary.keyDevelopments.map(d => `• ${d}`).join('\n')}\n\n` +
      `Riscos:\n${aiSummary.risks.map(r => `• ${r}`).join('\n')}\n\n` +
      `Oportunidades:\n${aiSummary.opportunities.map(o => `• ${o}`).join('\n')}\n\n` +
      `Impacto no Mercado:\n${aiSummary.marketImpact}`;

    await Share.share({ message });
  };

  const filteredArticles = useMemo(() => {
    return articles
      .filter((a) => {
        const matchesSearch =
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.source.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesDate = true;
        if (dateFilter !== 'ANY') {
          const published = new Date(a.publishedAt).getTime();
          const now = new Date().getTime();
          const diff = now - published;
          if (dateFilter === '24H') matchesDate = diff <= 24 * 3600 * 1000;
          else if (dateFilter === '7D') matchesDate = diff <= 7 * 24 * 3600 * 1000;
          else if (dateFilter === '30D') matchesDate = diff <= 30 * 24 * 3600 * 1000;
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const timeA = new Date(a.publishedAt).getTime();
        const timeB = new Date(b.publishedAt).getTime();
        return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });
  }, [articles, searchQuery, dateFilter, sortOrder]);

  const renderArticle = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      className="bg-surface-container rounded-xl overflow-hidden mb-4 border border-outline-variant/10"
      onPress={() => navigation.navigate('NewsDetails', { article: item })}
    >
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-label-sm text-primary font-bold">{item.source}</Text>
          <Text className="text-[10px] text-on-surface-variant">
            {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        <Text className="text-body-md font-bold text-on-surface mb-2" numberOfLines={2}>{item.title}</Text>
        <Text className="text-label-md text-on-surface-variant" numberOfLines={3}>{item.summary}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 h-20 border-b border-outline-variant/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full">
          <MaterialIcons name="arrow-back" size={26} color={Colors.onSurface} />
        </TouchableOpacity>
        <View className="ml-2">
          <Text className="text-headline-md font-bold text-on-surface leading-tight uppercase">
            {symbolParam ? nameParam : 'Notícias do Mercado'}
          </Text>
          <Text className="text-label-md text-on-surface-variant font-bold tracking-widest">
            {symbolParam ? symbolParam : 'BUSCAR ATIVO'}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View className="mb-6">
            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={onRefresh}
                activeOpacity={0.7}
                className="flex-1 h-14 bg-surface-variant rounded-2xl flex-row items-center justify-center gap-2"
              >
                <MaterialIcons name="refresh" size={20} color={Colors.onSurfaceVariant} />
                <Text className="text-on-surface-variant font-bold text-label-md">Atualizar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleGenerateSummary}
                disabled={generatingSummary || articles.length === 0}
                className="flex-1"
                activeOpacity={0.8}
              >
                <View
                  className="h-14 flex-row items-center justify-center gap-2 px-4"
                  style={{
                    backgroundColor: generatingSummary || articles.length === 0 ? Colors.surfaceVariant : '#7c69ef',
                    opacity: generatingSummary || articles.length === 0 ? 0.6 : 1,
                    borderRadius: 16
                  }}
                >
                  {generatingSummary ? (
                    <ActivityIndicator color="#1a1c2e" size="small" />
                  ) : (
                    <MaterialIcons
                      name="auto-awesome"
                      size={20}
                      color={generatingSummary || articles.length === 0 ? Colors.onSurfaceVariant : "#1a1c2e"}
                    />
                  )}
                  <Text
                    className="font-bold text-label-md"
                    style={{
                      color: generatingSummary || articles.length === 0 ? Colors.onSurfaceVariant : '#1a1c2e'
                    }}
                  >
                    Resumo com IA
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Search & Filters */}
            <View className="flex-row gap-2 mb-6">
              <View className="flex-1 bg-surface-container-low rounded-xl px-4 flex-row items-center border border-outline-variant/10">
                <MaterialIcons name="search" size={22} color={Colors.outline} />
                <TextInput
                  className="flex-1 h-12 ml-2 text-on-surface text-label-md"
                  placeholder="Buscar ticker (ex: PETR4)..."
                  placeholderTextColor={Colors.outline}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  autoCapitalize="characters"
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity
                className="bg-surface-container-low w-12 h-12 rounded-xl items-center justify-center border border-outline-variant/10"
                onPress={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              >
                <MaterialIcons name="filter-list" size={22} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {(['ANY', '24H', '7D', '30D'] as DateFilter[]).map((f) => {
                  const active = dateFilter === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setDateFilter(f)}
                       className={`px-4 py-2 rounded-full border ${
                           active ? 'bg-white border-transparent' : 'bg-surface-container-low border-outline-variant/30'
                      }`}
                    >
                      <Text className={`text-[12px] font-bold ${active ? 'text-black' : 'text-on-surface-variant'}`}>
                        {f === 'ANY' ? 'Sempre' : f === '24H' ? 'Últimas 24h' : f === '7D' ? '7 dias' : '30 dias'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View className="py-20 items-center">
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text className="text-on-surface-variant text-label-md mt-4">Carregando notícias...</Text>
            </View>
          ) : (
            <View className="py-20 items-center">
              <MaterialIcons name="newspaper" size={48} color={Colors.outline} />
              <Text className="text-on-surface-variant text-body-md mt-4">Nenhuma notícia encontrada.</Text>
            </View>
          )
        }
      />

      {/* AI Summary Modal */}
      <Modal
        visible={summaryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSummaryModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
                <Text className="text-headline-md font-bold text-on-surface">Resumo IA</Text>
              </View>
              <TouchableOpacity onPress={() => setSummaryModalVisible(false)} className="p-2">
                <MaterialIcons name="close" size={24} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            {aiSummary && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                  <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Sentimento Geral</Text>
                  <View className={`self-start px-3 py-1 rounded-full flex-row items-center gap-1.5 ${
                    aiSummary.sentiment === 'POSITIVE' ? 'bg-success/10' :
                    aiSummary.sentiment === 'NEGATIVE' ? 'bg-error/10' : 'bg-outline-variant/20'
                  }`}>
                    <View className={`w-2.5 h-2.5 rounded-full ${
                      aiSummary.sentiment === 'POSITIVE' ? 'bg-success' :
                      aiSummary.sentiment === 'NEGATIVE' ? 'bg-error' : 'bg-outline'
                    }`} />
                    <Text className={`text-label-md font-bold ${
                      aiSummary.sentiment === 'POSITIVE' ? 'text-success' :
                      aiSummary.sentiment === 'NEGATIVE' ? 'text-error' : 'text-on-surface-variant'
                    }`}>
                      {aiSummary.sentiment === 'POSITIVE' ? 'Positivo' : aiSummary.sentiment === 'NEGATIVE' ? 'Negativo' : 'Neutro'}
                    </Text>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Principais Desenvolvimentos</Text>
                  {aiSummary.keyDevelopments.map((item, index) => (
                    <View key={index} className="flex-row items-start gap-2 mb-2">
                      <Text className="text-primary font-bold mt-0.5">•</Text>
                      <Text className="text-body-md text-on-surface flex-1">{item}</Text>
                    </View>
                  ))}
                </View>

                {aiSummary.risks.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-label-md text-error uppercase tracking-wider mb-3">Riscos Potenciais</Text>
                    {aiSummary.risks.map((item, index) => (
                      <View key={index} className="flex-row items-start gap-2 mb-2">
                        <Text className="text-error font-bold mt-0.5">•</Text>
                        <Text className="text-body-md text-on-surface flex-1">{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {aiSummary.opportunities.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-label-md text-success uppercase tracking-wider mb-3">Oportunidades</Text>
                    {aiSummary.opportunities.map((item, index) => (
                      <View key={index} className="flex-row items-start gap-2 mb-2">
                        <Text className="text-success font-bold mt-0.5">•</Text>
                        <Text className="text-body-md text-on-surface flex-1">{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View className="mb-8 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                  <Text className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Impacto no Mercado</Text>
                  <Text className="text-body-md text-on-surface leading-6">{aiSummary.marketImpact}</Text>
                </View>

                <TouchableOpacity
                  onPress={handleShareSummary}
                  className="w-full h-14 bg-primary-container rounded-xl flex-row items-center justify-center gap-2 mb-4"
                >
                  <MaterialIcons name="share" size={20} color={Colors.onPrimaryContainer} />
                  <Text className="text-on-primary-container font-bold text-label-md">Compartilhar Resumo</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
