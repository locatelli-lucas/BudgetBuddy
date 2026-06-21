package com.budgetbuddy.infrastructure.finance;

import com.budgetbuddy.domain.market.dto.HistoricalPoint;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.dto.SearchResult;
import com.budgetbuddy.infrastructure.currency.AwesomeApiService;
import com.budgetbuddy.infrastructure.currency.dto.CurrencyRateResponse;
import com.budgetbuddy.infrastructure.news.NewsApiService;
import com.budgetbuddy.infrastructure.news.dto.NewsArticleResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final YahooFinanceService yahooFinanceService;
    private final AwesomeApiService awesomeApiService;
    private final NewsApiService newsApiService;

    @GetMapping("/quote/{ticker}")
    public ResponseEntity<ApiResponse<com.budgetbuddy.infrastructure.finance.dto.QuoteResponse>> getQuote(
            @PathVariable String ticker) {
        QuoteResponse q = yahooFinanceService.getQuote(ticker);
        return ResponseEntity.ok(ApiResponse.success(
                com.budgetbuddy.infrastructure.finance.dto.QuoteResponse.builder()
                        .ticker(q.getSymbol())
                        .name(q.getName())
                        .price(q.getPrice())
                        .change(q.getChange())
                        .changePercent(q.getChangePercent())
                        .build()));
    }

    @GetMapping("/history/{ticker}")
    public ResponseEntity<ApiResponse<List<HistoricalPoint>>> getHistory(
            @PathVariable String ticker,
            @RequestParam(defaultValue = "1M") String period) {
        return ResponseEntity.ok(ApiResponse.success(
                yahooFinanceService.getHistoricalData(ticker, period)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SearchResult>>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(ApiResponse.success(yahooFinanceService.searchAsset(query)));
    }

    @GetMapping("/currency")
    public ResponseEntity<ApiResponse<CurrencyRateResponse>> getCurrency(
            @RequestParam(defaultValue = "USD") String from,
            @RequestParam(defaultValue = "BRL") String to) {
        return ResponseEntity.ok(ApiResponse.success(awesomeApiService.getExchangeRate(from, to)));
    }

    @GetMapping("/news")
    public ResponseEntity<ApiResponse<List<NewsArticleResponse>>> getNews() {
        return ResponseEntity.ok(ApiResponse.success(newsApiService.getFinancialNews()));
    }
}
