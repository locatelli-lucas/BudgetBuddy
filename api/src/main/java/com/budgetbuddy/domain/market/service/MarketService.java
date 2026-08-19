package com.budgetbuddy.domain.market.service;

import com.budgetbuddy.domain.market.dto.HistoricalPoint;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.dto.SearchResult;
import com.budgetbuddy.domain.market.provider.MarketDataProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketService {

    private final MarketDataProvider provider;

    /** For REST endpoints — returns cached data (TTL: 5 min). */
    @Cacheable(value = "market-quotes", key = "#symbol")
    public QuoteResponse getQuote(String symbol) {
        return provider.getQuote(symbol);
    }

    /**
     * For schedulers — always fetches fresh data from Yahoo Finance
     * and refreshes the cache so subsequent REST calls are also up-to-date.
     */
    @CacheEvict(value = "market-quotes", key = "#symbol")
    public QuoteResponse getQuoteFresh(String symbol) {
        return provider.getQuote(symbol);
    }

    public List<QuoteResponse> getQuotes(List<String> symbols) {
        return symbols.stream().map(this::getQuote).toList();
    }

    @Cacheable(value = "market-history", key = "#symbol + '-' + #period")
    public List<HistoricalPoint> getHistoricalData(String symbol, String period) {
        return provider.getHistoricalData(symbol, period);
    }

    @Cacheable(value = "market-search", key = "#query")
    public List<SearchResult> searchAsset(String query) {
        return provider.searchAsset(query);
    }
}
