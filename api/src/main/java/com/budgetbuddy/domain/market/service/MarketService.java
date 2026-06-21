package com.budgetbuddy.domain.market.service;

import com.budgetbuddy.domain.market.dto.HistoricalPoint;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.dto.SearchResult;
import com.budgetbuddy.domain.market.provider.MarketDataProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketService {

    private final MarketDataProvider provider;

    @Cacheable(value = "market-quotes", key = "#symbol")
    public QuoteResponse getQuote(String symbol) {
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
