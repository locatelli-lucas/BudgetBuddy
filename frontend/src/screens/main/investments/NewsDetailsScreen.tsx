import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, Linking, Share, StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';

export function NewsDetailsScreen({ navigation, route }: any) {
  const article = route.params?.article;

  // Fallback view if article is missing
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={26} color={Colors.onSurface} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>NOTÍCIA</Text>

        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <MaterialIcons name="share" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="newspaper" size={64} color={Colors.outline} />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.sourceText}>{article.source || 'Fonte'}</Text>
              {displayDate ? (
                <Text style={styles.dateText}>{displayDate}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.titleText}>{article.title}</Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{article.summary}</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={handleOpenOriginal}
          >
            <MaterialIcons name="open-in-new" size={20} color="#1a1c2e" />
            <Text style={styles.actionButtonText}>LER ARTIGO COMPLETO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#11131b', // Fixed background to match Colors.background
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
    borderBottomColor: 'rgba(67, 70, 85, 0.2)', // outline-variant/20
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e1e2ed',
    letterSpacing: 1.5,
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
    marginBottom: 24,
  },
  sourceText: {
    fontSize: 14,
    color: '#b4c5ff', // Colors.primary
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#c3c6d7', // Colors.onSurfaceVariant
    marginTop: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e1e2ed',
    marginBottom: 24,
    lineHeight: 32,
  },
  summaryContainer: {
    backgroundColor: '#1d1f27', // Colors.surfaceContainer
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(67, 70, 85, 0.1)',
  },
  summaryText: {
    fontSize: 16,
    color: '#c3c6d7',
    lineHeight: 26,
  },
  actionButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#b4c5ff', // Colors.primary
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#1a1c2e',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
