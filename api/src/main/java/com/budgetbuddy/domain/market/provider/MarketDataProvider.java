package com.budgetbuddy.domain.market.provider;

import com.budgetbuddy.domain.market.dto.HistoricalPoint;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.dto.SearchResult;

import java.util.List;

public interface MarketDataProvider {

    QuoteResponse getQuote(String symbol);

    List<QuoteResponse> getQuotes(List<String> symbols);

    List<HistoricalPoint> getHistoricalData(String symbol, String period);

    List<SearchResult> searchAsset(String query);
}
