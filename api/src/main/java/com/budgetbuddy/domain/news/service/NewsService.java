package com.budgetbuddy.domain.news.service;

import com.budgetbuddy.domain.news.dto.*;
import com.budgetbuddy.domain.news.entity.NewsArticleAnalysis;
import com.budgetbuddy.domain.news.provider.NewsProvider;
import com.budgetbuddy.domain.news.repository.NewsArticleAnalysisRepository;
import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsProvider newsProvider;
    private final AiProvider aiProvider;
    private final ObjectMapper objectMapper;
    private final ArticleContentExtractorService contentExtractor;
    private final NewsArticleAnalysisRepository analysisRepository;

    private static final Map<String, String> TICKER_MAPPING = new HashMap<>();

    static {
        TICKER_MAPPING.put("PETR4", "Petrobras");
        TICKER_MAPPING.put("VALE3", "Vale");
        TICKER_MAPPING.put("ITUB4", "Itaú Unibanco");
        TICKER_MAPPING.put("BBAS3", "Banco do Brasil");
        TICKER_MAPPING.put("BBDC4", "Bradesco");
        TICKER_MAPPING.put("ABEV3", "Ambev");
        TICKER_MAPPING.put("MGLU3", "Magazine Luiza");
        TICKER_MAPPING.put("WEGE3", "Weg");
        TICKER_MAPPING.put("B3SA3", "B3");
        TICKER_MAPPING.put("SANB11", "Santander Brasil");
        TICKER_MAPPING.put("MXRF11", "Maxi Renda");
        TICKER_MAPPING.put("HGLG11", "CSHG Logística");
        TICKER_MAPPING.put("KNRI11", "Kinea Renda Imobiliária");
        TICKER_MAPPING.put("VISC11", "Vinci Shopping");
        TICKER_MAPPING.put("XPML11", "XP Malls");
        TICKER_MAPPING.put("IVVB11", "S&P 500 ETF");
        TICKER_MAPPING.put("BOVA11", "iShares Ibovespa");
        TICKER_MAPPING.put("SMAL11", "iShares Small Cap");
        TICKER_MAPPING.put("BTC", "Bitcoin");
        TICKER_MAPPING.put("ETH", "Ethereum");
        TICKER_MAPPING.put("SOL", "Solana");
    }

    @Cacheable(value = "news", key = "#symbol + #page + #size", unless = "#result == null")
    public List<NewsArticleResponse> getAssetNews(String symbol, int page, int size) {
        String cleanSymbol = symbol.replace(".SA", "");
        String query = TICKER_MAPPING.getOrDefault(cleanSymbol.toUpperCase(), cleanSymbol);
        
        log.info("Fetching news for symbol: {} with query: {}", symbol, query);
        
        List<NewsArticleResponse> news = newsProvider.getAssetNews(symbol, query, page, size);
        
        // Enrich with stored sentiment if available
        news.forEach(article -> {
            analysisRepository.findByUrl(article.getUrl())
                    .ifPresent(analysis -> article.setSentiment(analysis.getSentiment()));
        });
        
        return news;
    }

    public NewsArticleAnalysisResponse analyzeArticle(String url, String symbol, String title, String source, ZonedDateTime publishedAt) {
        Optional<NewsArticleAnalysis> existing = analysisRepository.findByUrl(url);
        if (existing.isPresent()) {
            return mapToAnalysisResponse(existing.get());
        }

        log.info("Analyzing new article: {}", url);
        String content = contentExtractor.extractContent(url);
        
        if (content == null || content.length() < 100) {
            log.warn("Article content too short for analysis: {}", url);
            return null;
        }

        String prompt = String.format("""
                Analise o seguinte artigo sobre o ativo %s e gere uma análise estruturada em JSON.
                
                Conteúdo do artigo:
                %s
                
                O formato do JSON deve ser exatamente:
                {
                  "summary": "resumo executivo de no máximo 150 palavras",
                  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
                  "opportunities": ["oportunidade 1", "oportunidade 2"],
                  "risks": ["risco 1", "risco 2"],
                  "marketImpact": "explicação do impacto no mercado para o ativo %s"
                }
                
                Responda APENAS o JSON válido, sem tags de markdown.
                """, symbol, content, symbol);

        try {
            String aiResponse = aiProvider.generateSummary(prompt);
            aiResponse = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            Map<String, Object> result = objectMapper.readValue(aiResponse, new TypeReference<Map<String, Object>>() {});

            NewsArticleAnalysis analysis = NewsArticleAnalysis.builder()
                    .assetSymbol(symbol)
                    .title(title)
                    .source(source)
                    .url(url)
                    .publishedAt(publishedAt)
                    .articleContent(content)
                    .aiSummary((String) result.get("summary"))
                    .sentiment(NewsSentiment.valueOf((String) result.get("sentiment")))
                    .opportunities(objectMapper.writeValueAsString(result.get("opportunities")))
                    .risks(objectMapper.writeValueAsString(result.get("risks")))
                    .marketImpact((String) result.get("marketImpact"))
                    .build();

            analysis = analysisRepository.save(analysis);
            return mapToAnalysisResponse(analysis);
        } catch (Exception e) {
            log.error("Failed to analyze article {}: {}", url, e.getMessage());
            return null;
        }
    }

    public AssetNewsOverviewResponse getAssetOverview(String symbol) {
        ZonedDateTime sevenDaysAgo = ZonedDateTime.now().minusDays(7);
        List<NewsArticleAnalysis> recentAnalyses = analysisRepository.findByAssetSymbolAndPublishedAtAfter(symbol, sevenDaysAgo);
        
        if (recentAnalyses.isEmpty()) {
            // Fallback: try to fetch and analyze at least one if none found
            return generateEmptyOverview(symbol);
        }

        String aggregation = recentAnalyses.stream()
                .map(a -> String.format("Título: %s\nSumário: %s\nSentimento: %s", a.getTitle(), a.getAiSummary(), a.getSentiment()))
                .collect(Collectors.joining("\n\n"));

        String prompt = String.format("""
                Gere uma visão geral semanal (Weekly Overview) para o ativo %s com base nas seguintes análises de notícias recentes:
                
                %s
                
                O formato do JSON deve ser exatamente:
                {
                  "overallSentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
                  "summary": "visão geral do que está acontecendo com o ativo",
                  "mainTopics": ["tópico 1", "tópico 2"],
                  "risks": ["risco consolidado 1", "risco consolidado 2"],
                  "opportunities": ["oportunidade consolidada 1", "oportunidade consolidada 2"]
                }
                
                Responda APENAS o JSON.
                """, symbol, aggregation);

        try {
            String aiResponse = aiProvider.generateSummary(prompt);
            aiResponse = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(aiResponse, AssetNewsOverviewResponse.class);
        } catch (Exception e) {
            log.error("Failed to generate overview for {}: {}", symbol, e.getMessage());
            return generateEmptyOverview(symbol);
        }
    }

    private NewsArticleAnalysisResponse mapToAnalysisResponse(NewsArticleAnalysis analysis) {
        try {
            return NewsArticleAnalysisResponse.builder()
                    .title(analysis.getTitle())
                    .source(analysis.getSource())
                    .url(analysis.getUrl())
                    .publishedAt(analysis.getPublishedAt())
                    .articleContent(analysis.getArticleContent())
                    .aiSummary(analysis.getAiSummary())
                    .sentiment(analysis.getSentiment())
                    .opportunities(objectMapper.readValue(analysis.getOpportunities(), new TypeReference<List<String>>() {}))
                    .risks(objectMapper.readValue(analysis.getRisks(), new TypeReference<List<String>>() {}))
                    .marketImpact(analysis.getMarketImpact())
                    .build();
        } catch (Exception e) {
            return null;
        }
    }

    private AssetNewsOverviewResponse generateEmptyOverview(String symbol) {
        return AssetNewsOverviewResponse.builder()
                .overallSentiment(NewsSentiment.NEUTRAL)
                .summary("Não há dados suficientes para uma visão geral detalhada esta semana.")
                .mainTopics(List.of("Aguardando mais notícias"))
                .risks(List.of())
                .opportunities(List.of())
                .build();
    }

    public NewsAiSummaryResponse generateAiSummary(String symbol) {
        List<NewsArticleResponse> news = getAssetNews(symbol, 1, 10);
        
        if (news.isEmpty()) {
            return NewsAiSummaryResponse.builder()
                    .sentiment(NewsSentiment.NEUTRAL)
                    .keyDevelopments(List.of("Nenhuma notícia recente encontrada."))
                    .risks(List.of())
                    .opportunities(List.of())
                    .marketImpact("Sem impacto detectado devido à falta de notícias.")
                    .build();
        }

        String newsContent = news.stream()
                .map(a -> String.format("Título: %s\nSumário: %s", a.getTitle(), a.getSummary()))
                .collect(Collectors.joining("\n\n"));

        String prompt = String.format("""
                Analise as seguintes notícias sobre o ativo %s e gere um resumo estruturado em formato JSON.
                As notícias são:
                %s
                
                O formato do JSON deve ser exatamente:
                {
                  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
                  "keyDevelopments": ["ponto 1", "ponto 2"],
                  "risks": ["risco 1", "risco 2"],
                  "opportunities": ["oportunidade 1", "oportunidade 2"],
                  "marketImpact": "breve explicação"
                }
                
                Responda APENAS o JSON. Priorize o contexto do mercado brasileiro.
                """, symbol, newsContent);

        try {
            String aiResponse = aiProvider.generateSummary(prompt);
            aiResponse = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            return objectMapper.readValue(aiResponse, NewsAiSummaryResponse.class);
        } catch (Exception e) {
            log.error("Failed to generate AI summary for {}", symbol, e);
            return NewsAiSummaryResponse.builder()
                    .sentiment(NewsSentiment.NEUTRAL)
                    .keyDevelopments(List.of("Falha ao gerar resumo automático."))
                    .risks(List.of())
                    .opportunities(List.of())
                    .marketImpact("Tente novamente mais tarde.")
                    .build();
        }
    }
}
