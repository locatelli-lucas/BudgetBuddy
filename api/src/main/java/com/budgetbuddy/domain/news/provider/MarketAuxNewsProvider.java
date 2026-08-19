package com.budgetbuddy.domain.news.provider;

import com.budgetbuddy.domain.news.dto.NewsArticleResponse;
import com.budgetbuddy.domain.news.dto.NewsSentiment;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class MarketAuxNewsProvider implements NewsProvider {

    private final WebClient webClient;
    private final String apiKey;

    public MarketAuxNewsProvider(WebClient.Builder webClientBuilder, 
                                 @Value("${marketaux.api.key:YfRBOoPZqlwnc5GGPWCJexyA7X83rht9uIZpAXzN}") String apiKey) {
        this.webClient = webClientBuilder.baseUrl("https://api.marketaux.com/v1").build();
        this.apiKey = apiKey;
    }

    @Override
    public List<NewsArticleResponse> getAssetNews(String symbol, String query, int page, int size) {
        try {
            MarketAuxResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/news/all")
                            .queryParam("symbols", symbol)
                            .queryParam("search", query)
                            .queryParam("api_token", apiKey)
                            .queryParam("page", page)
                            .queryParam("limit", size)
                            .queryParam("language", "pt,en")
                            .build())
                    .retrieve()
                    .bodyToMono(MarketAuxResponse.class)
                    .block();

            if (response == null || response.getData() == null) {
                return new ArrayList<>();
            }

            return response.getData().stream()
                    .map(this::mapToDto)
                    .toList();
        } catch (Exception e) {
            log.error("Failed to fetch news from MarketAux for symbol: {}", symbol, e);
            return new ArrayList<>();
        }
    }

    private NewsArticleResponse mapToDto(MarketAuxData data) {
        NewsSentiment sentiment = NewsSentiment.NEUTRAL;
        
        // Use overall sentiment if available
        if (data.getEntities() != null) {
            double avgScore = data.getEntities().stream()
                    .mapToDouble(MarketAuxEntity::getSentimentScore)
                    .average()
                    .orElse(0.0);
            
            if (avgScore > 0.1) sentiment = NewsSentiment.POSITIVE;
            else if (avgScore < -0.1) sentiment = NewsSentiment.NEGATIVE;
        }

        return NewsArticleResponse.builder()
                .id(data.getUuid())
                .title(data.getTitle())
                .summary(data.getSnippet())
                .source(data.getSource())
                .publishedAt(data.getPublishedAt())
                .url(data.getUrl())
                .imageUrl(data.getImageUrl())
                .sentiment(sentiment)
                .build();
    }

    @Data
    private static class MarketAuxResponse {
        private List<MarketAuxData> data;
    }

    @Data
    private static class MarketAuxData {
        private String uuid;
        private String title;
        private String snippet;
        private String url;
        @JsonProperty("image_url")
        private String imageUrl;
        @JsonProperty("published_at")
        private ZonedDateTime publishedAt;
        private String source;
        private List<MarketAuxEntity> entities;
    }

    @Data
    private static class MarketAuxEntity {
        private String symbol;
        @JsonProperty("sentiment_score")
        private double sentimentScore;
    }
}
