package com.budgetbuddy.domain.news.service;

import com.budgetbuddy.domain.news.dto.NewsAiSummaryResponse;
import com.budgetbuddy.domain.news.dto.NewsArticleResponse;
import com.budgetbuddy.domain.news.dto.NewsSentiment;
import com.budgetbuddy.domain.news.provider.NewsProvider;
import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsProvider newsProvider;
    private final AiProvider aiProvider;
    private final ObjectMapper objectMapper;

    private static final Map<String, String> TICKER_MAPPING = new HashMap<>();

    static {
        // Stocks
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
        
        // FIIs
        TICKER_MAPPING.put("MXRF11", "Maxi Renda");
        TICKER_MAPPING.put("HGLG11", "CSHG Logística");
        TICKER_MAPPING.put("KNRI11", "Kinea Renda Imobiliária");
        TICKER_MAPPING.put("VISC11", "Vinci Shopping");
        TICKER_MAPPING.put("XPML11", "XP Malls");
        
        // ETFs
        TICKER_MAPPING.put("IVVB11", "S&P 500 ETF");
        TICKER_MAPPING.put("BOVA11", "iShares Ibovespa");
        TICKER_MAPPING.put("SMAL11", "iShares Small Cap");
        
        // Crypto
        TICKER_MAPPING.put("BTC", "Bitcoin");
        TICKER_MAPPING.put("ETH", "Ethereum");
        TICKER_MAPPING.put("SOL", "Solana");
    }

    @Cacheable(value = "news", key = "#symbol + #page + #size", unless = "#result == null")
    public List<NewsArticleResponse> getAssetNews(String symbol, int page, int size) {
        String cleanSymbol = symbol.replace(".SA", "");
        String query = TICKER_MAPPING.getOrDefault(cleanSymbol.toUpperCase(), cleanSymbol);
        
        log.info("Fetching news for symbol: {} with query: {}", symbol, query);
        
        return newsProvider.getAssetNews(symbol, query, page, size);
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
            // Simple cleanup if AI includes markdown code blocks
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
