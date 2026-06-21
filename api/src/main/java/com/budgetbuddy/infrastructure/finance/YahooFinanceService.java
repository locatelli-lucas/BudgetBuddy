package com.budgetbuddy.infrastructure.finance;

import com.budgetbuddy.domain.market.dto.HistoricalPoint;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.dto.SearchResult;
import com.budgetbuddy.domain.market.service.MarketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class YahooFinanceService {

    private final MarketService marketService;

    public QuoteResponse getQuote(String ticker) {
        return marketService.getQuote(ticker);
    }

    public List<QuoteResponse> getQuotes(List<String> tickers) {
        return marketService.getQuotes(tickers);
    }

    public List<HistoricalPoint> getHistoricalData(String ticker, String period) {
        return marketService.getHistoricalData(ticker, period);
    }

    public List<SearchResult> searchAsset(String query) {
        return marketService.searchAsset(query);
    }
}
