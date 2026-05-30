package com.budgetbuddy.infrastructure.news;

import com.budgetbuddy.infrastructure.news.dto.NewsArticleResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class NewsApiService {

    public List<NewsArticleResponse> getFinancialNews() {
        // Mocking NewsAPI call
        log.info("Fetching financial news from NewsAPI");
        return List.of(
                NewsArticleResponse.builder()
                        .title("Mercado Financeiro hoje: Dólar cai e Bolsa sobe")
                        .description("O Ibovespa opera em alta nesta terça-feira, impulsionado por resultados corporativos.")
                        .url("https://example.com/news/1")
                        .source("Valor Econômico")
                        .publishedAt("2026-05-24T10:00:00Z")
                        .build(),
                NewsArticleResponse.builder()
                        .title("Copom decide manter a taxa Selic em 10,50%")
                        .description("O Comitê de Política Monetária (Copom) do Banco Central decidiu por unanimidade manter a taxa básica de juros.")
                        .url("https://example.com/news/2")
                        .source("G1 Economia")
                        .publishedAt("2026-05-23T18:00:00Z")
                        .build()
        );
    }
}
