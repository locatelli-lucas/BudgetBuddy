import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList,
  ActivityIndicator, Image, TextInput, RefreshControl, Modal,
  Share, StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { newsService, NewsArticle, NewsAiSummary, AssetNewsOverview } from '../../../services/news.service';

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

  // AI & Stats State
  const [overview, setOverview] = useState<AssetNewsOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

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

  const loadOverview = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoadingOverview(true);
    try {
      const data = await newsService.getAssetOverview(query.toUpperCase());
      setOverview(data);
    } catch (err) {
      console.error('Failed to load overview', err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    if (symbolParam) {
      loadNews(symbolParam);
      loadOverview(symbolParam);
    }
  }, [symbolParam, loadNews, loadOverview]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews(searchQuery);
    loadOverview(searchQuery);
  };

  const handleSearchSubmit = () => {
    loadNews(searchQuery);
    loadOverview(searchQuery);
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

  const sentimentStats = useMemo(() => {
    if (articles.length === 0) return null;
    const pos = articles.filter(a => a.sentiment === 'POSITIVE').length;
    const neg = articles.filter(a => a.sentiment === 'NEGATIVE').length;
    const neu = articles.filter(a => a.sentiment === 'NEUTRAL').length;

    let overall = 'Neutro';
    let color = Colors.outline;
    if (pos > neg && pos > neu) { overall = 'Positivo'; color = Colors.success; }
    else if (neg > pos && neg > neu) { overall = 'Negativo'; color = Colors.error; }

    return { pos, neg, neu, overall, color };
  }, [articles]);

  const renderArticle = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => navigation.navigate('NewsDetails', { article: item, symbol: symbolParam || searchQuery })}
    >
      <View style={styles.articleContent}>
        <View style={styles.articleMeta}>
          <Text style={styles.articleSource}>{item.source}</Text>
          <View style={styles.metaRight}>
            <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(item.sentiment) + '20' }]}>
              <View style={[styles.sentimentDot, { backgroundColor: getSentimentColor(item.sentiment) }]} />
              <Text style={[styles.sentimentText, { color: getSentimentColor(item.sentiment) }]}>
                {item.sentiment === 'POSITIVE' ? 'Positivo' : item.sentiment === 'NEGATIVE' ? 'Negativo' : 'Neutro'}
              </Text>
            </View>
            <Text style={styles.articleDate}>
              {new Date(item.publishedAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.articleSummary} numberOfLines={2}>{item.summary}</Text>
      </View>
    </TouchableOpacity>
  );

  const getSentimentColor = (s: string) => {
    if (s === 'POSITIVE') return Colors.success;
    if (s === 'NEGATIVE') return Colors.error;
    return Colors.outline;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{symbolParam ? nameParam : 'Notícias do Mercado'}</Text>
          <Text style={styles.headerSubtitle}>{symbolParam ? symbolParam : 'BUSCAR ATIVO'}</Text>
        </View>
      </View>

      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticle}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
             {/* Stats Bar */}
             {sentimentStats && (
              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Artigos</Text>
                  <Text style={styles.statValue}>{articles.length}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Sentimento</Text>
                  <Text style={[styles.statValue, { color: sentimentStats.color }]}>{sentimentStats.overall}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Atualizado</Text>
                  <Text style={styles.statValue}>Agora</Text>
                </View>
              </View>
            )}

            {/* Weekly Overview Card */}
            {(symbolParam || searchQuery) && (
              <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                  <View style={styles.overviewTitleRow}>
                    <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
                    <Text style={styles.overviewTitle}>Panorama Semanal</Text>
                  </View>
                  {loadingOverview ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : overview && (
                    <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(overview.overallSentiment) + '20' }]}>
                      <Text style={[styles.sentimentText, { color: getSentimentColor(overview.overallSentiment) }]}>
                        {overview.overallSentiment === 'POSITIVE' ? 'Positivo' : overview.overallSentiment === 'NEGATIVE' ? 'Negativo' : 'Neutro'}
                      </Text>
                    </View>
                  )}
                </View>

                {loadingOverview ? (
                  <View style={styles.overviewLoading}>
                    <Text style={styles.loadingText}>Gerando análise inteligente...</Text>
                  </View>
                ) : overview ? (
                  <View style={styles.overviewContent}>
                    <Text style={styles.overviewSummary}>{overview.summary}</Text>

                    <View style={styles.overviewGrid}>
                      <View style={styles.overviewSection}>
                        <Text style={styles.sectionLabel}>Tópicos Principais</Text>
                        {overview.mainTopics.map((t, i) => (
                          <Text key={i} style={styles.bulletItem}>• {t}</Text>
                        ))}
                      </View>
                    </View>

                    <View style={styles.overviewRow}>
                       <View style={styles.halfSection}>
                        <Text style={[styles.sectionLabel, { color: Colors.error }]}>Riscos</Text>
                        {overview.risks.slice(0, 2).map((r, i) => (
                          <Text key={i} style={styles.bulletItem}>• {r}</Text>
                        ))}
                      </View>
                      <View style={styles.halfSection}>
                        <Text style={[styles.sectionLabel, { color: Colors.success }]}>Oportunidades</Text>
                        {overview.opportunities.slice(0, 2).map((o, i) => (
                          <Text key={i} style={styles.bulletItem}>• {o}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            {/* Search & Filters */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={22} color={Colors.outline} />
                <TextInput
                  style={styles.searchInput}
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
                style={styles.filterButton}
                onPress={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
              >
                <MaterialIcons name="filter-list" size={22} color={Colors.outline} />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              <View style={styles.filtersContainer}>
                {(['ANY', '24H', '7D', '30D'] as DateFilter[]).map((f) => {
                  const active = dateFilter === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setDateFilter(f)}
                      style={[
                        styles.filterChip,
                        active ? styles.filterChipActive : styles.filterChipInactive
                      ]}
                    >
                      <Text style={[
                        styles.filterChipText,
                        active ? styles.filterChipTextActive : styles.filterChipTextInactive
                      ]}>
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
            <View style={styles.emptyState}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.emptyText}>Carregando notícias...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="newspaper" size={64} color={Colors.outline} />
              <Text style={styles.emptyTitle}>Nenhuma notícia encontrada</Text>
              <Text style={styles.emptySubtitle}>Tente buscar por outro ativo ou termo.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11131b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(67, 70, 85, 0.2)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e1e2ed',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#c3c6d7',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 24,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(67, 70, 85, 0.3)',
  },
  statLabel: {
    fontSize: 10,
    color: '#c3c6d7',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e1e2ed',
  },
  overviewCard: {
    backgroundColor: '#1d1f27',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(180, 197, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b4c5ff',
  },
  overviewLoading: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#c3c6d7',
    fontSize: 14,
    fontStyle: 'italic',
  },
  overviewContent: {
    gap: 16,
  },
  overviewSummary: {
    fontSize: 14,
    color: '#e1e2ed',
    lineHeight: 22,
  },
  overviewGrid: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(67, 70, 85, 0.2)',
    paddingTop: 16,
  },
  overviewSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c3c6d7',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bulletItem: {
    fontSize: 13,
    color: '#c3c6d7',
    marginBottom: 4,
  },
  overviewRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfSection: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191b23',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: '#e1e2ed',
    fontSize: 14,
  },
  filterButton: {
    width: 56,
    height: 56,
    backgroundColor: '#191b23',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  filterChipInactive: {
    backgroundColor: '#32343d',
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterChipTextActive: {
    color: '#11131b',
  },
  filterChipTextInactive: {
    color: '#c3c6d7',
  },
  articleCard: {
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
    overflow: 'hidden',
  },
  articleContent: {
    padding: 16,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleSource: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#b4c5ff',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sentimentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  articleDate: {
    fontSize: 10,
    color: '#c3c6d7',
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e1e2ed',
    marginBottom: 8,
    lineHeight: 22,
  },
  articleSummary: {
    fontSize: 14,
    color: '#c3c6d7',
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#c3c6d7',
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e1e2ed',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#c3c6d7',
    marginTop: 8,
  },
});
