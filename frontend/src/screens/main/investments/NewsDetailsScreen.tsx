import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, Linking, Share, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { newsService, NewsArticle, NewsArticleAnalysis } from '../../../services/news.service';

export function NewsDetailsScreen({ navigation, route }: any) {
  const { article, symbol } = route.params;
  const [analysis, setAnalysis] = useState<NewsArticleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await newsService.getArticleAnalysis(article, symbol);
        setAnalysis(data);
      } catch (err) {
        console.error('Failed to load analysis', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalysis();
  }, [article, symbol]);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ color: Colors.onSurface, fontSize: 18 }}>Notícia não encontrada</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenOriginal = () => {
    if (article.url) {
      Linking.openURL(article.url);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\nLeia mais em: ${article.url}`,
        url: article.url,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const displayDate = React.useMemo(() => {
    try {
      if (article.publishedAt) {
        return new Date(article.publishedAt).toLocaleString('pt-BR');
      }
    } catch (e) {}
    return '';
  }, [article.publishedAt]);

  const getSentimentColor = (s: string) => {
    if (s === 'POSITIVE') return Colors.success;
    if (s === 'NEGATIVE') return Colors.error;
    return Colors.outline;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ANÁLISE IA</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <MaterialIcons name="share" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Header Section */}
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.mainImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="newspaper" size={64} color={Colors.outline} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.sourceText}>{article.source || 'Fonte'}</Text>
              <Text style={styles.dateText}>{displayDate}</Text>
            </View>
            {analysis && (
              <View style={[styles.sentimentBadge, { backgroundColor: getSentimentColor(analysis.sentiment) + '20' }]}>
                <View style={[styles.sentimentDot, { backgroundColor: getSentimentColor(analysis.sentiment) }]} />
                <Text style={[styles.sentimentText, { color: getSentimentColor(analysis.sentiment) }]}>
                  {analysis.sentiment === 'POSITIVE' ? 'Positivo' : analysis.sentiment === 'NEGATIVE' ? 'Negativo' : 'Neutro'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.titleText}>{article.title}</Text>

          {/* AI Analysis Sections */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={styles.loadingText}>Analisando notícia com IA...</Text>
            </View>
          ) : analysis ? (
            <View style={styles.analysisContainer}>
              {/* Executive Summary */}
              <View style={styles.analysisSection}>
                <View style={styles.sectionTitleRow}>
                  <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Resumo Executivo</Text>
                </View>
                <View style={styles.aiCard}>
                  <Text style={styles.aiSummaryText}>{analysis.aiSummary}</Text>
                </View>
              </View>

              {/* Opportunities & Risks Row */}
              <View style={styles.insightsRow}>
                <View style={styles.insightColumn}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialIcons name="trending-up" size={18} color={Colors.success} />
                    <Text style={[styles.sectionTitle, { color: Colors.success }]}>Oportunidades</Text>
                  </View>
                  {analysis.opportunities.map((o, i) => (
                    <Text key={i} style={styles.bulletItem}>✓ {o}</Text>
                  ))}
                </View>
                <View style={styles.insightColumn}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialIcons name="warning" size={18} color={Colors.error} />
                    <Text style={[styles.sectionTitle, { color: Colors.error }]}>Riscos</Text>
                  </View>
                  {analysis.risks.map((r, i) => (
                    <Text key={i} style={styles.bulletItem}>⚠ {r}</Text>
                  ))}
                </View>
              </View>

              {/* Market Impact */}
              <View style={styles.analysisSection}>
                <View style={styles.sectionTitleRow}>
                  <MaterialIcons name="bar-chart" size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Impacto Potencial</Text>
                </View>
                <View style={styles.impactCard}>
                  <Text style={styles.impactText}>{analysis.marketImpact}</Text>
                </View>
              </View>

              {/* Original Content Toggle */}
              <View style={styles.originalSection}>
                <TouchableOpacity
                  style={styles.collapseButton}
                  onPress={() => setShowFullContent(!showFullContent)}
                >
                  <Text style={styles.collapseButtonText}>
                    {showFullContent ? 'Ocultar Conteúdo Original' : 'Ler Conteúdo Original Completo'}
                  </Text>
                  <MaterialIcons
                    name={showFullContent ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={Colors.primary}
                  />
                </TouchableOpacity>

                {showFullContent && (
                  <View style={styles.originalContent}>
                    <Text style={styles.contentText}>{analysis.articleContent}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
             <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>Não foi possível gerar a análise para esta notícia.</Text>
             </View>
          )}

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity style={styles.primaryAction} onPress={handleOpenOriginal}>
              <MaterialIcons name="open-in-new" size={20} color="#1a1c2e" />
              <Text style={styles.primaryActionText}>ABRIR ORIGINAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11131b',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(67, 70, 85, 0.2)',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e1e2ed',
    letterSpacing: 2,
  },
  mainImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#32343d',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#32343d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: '#b4c5ff',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#c3c6d7',
    marginTop: 4,
  },
  sentimentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e1e2ed',
    marginBottom: 28,
    lineHeight: 30,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#c3c6d7',
    marginTop: 16,
    fontStyle: 'italic',
  },
  analysisContainer: {
    gap: 24,
  },
  analysisSection: {
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c3c6d7',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiCard: {
    backgroundColor: 'rgba(180, 197, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(180, 197, 255, 0.1)',
  },
  aiSummaryText: {
    fontSize: 16,
    color: '#e1e2ed',
    lineHeight: 26,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  insightColumn: {
    flex: 1,
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
  },
  bulletItem: {
    fontSize: 13,
    color: '#c3c6d7',
    marginTop: 8,
    lineHeight: 20,
  },
  impactCard: {
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
  },
  impactText: {
    fontSize: 15,
    color: '#c3c6d7',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  originalSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(67, 70, 85, 0.2)',
    paddingTop: 20,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(67, 70, 85, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  collapseButtonText: {
    fontSize: 14,
    color: '#b4c5ff',
    fontWeight: 'bold',
  },
  originalContent: {
    marginTop: 16,
    padding: 4,
  },
  contentText: {
    fontSize: 15,
    color: '#c3c6d7',
    lineHeight: 24,
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    height: 56,
    backgroundColor: '#b4c5ff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#1a1c2e',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconAction: {
    width: 56,
    height: 56,
    backgroundColor: '#1d1f27',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.2)',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#ffb4ab',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
