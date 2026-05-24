package com.budgetbuddy.infrastructure.finance;

import com.budgetbuddy.infrastructure.currency.AwesomeApiService;
import com.budgetbuddy.infrastructure.currency.dto.CurrencyRateResponse;
import com.budgetbuddy.infrastructure.finance.dto.QuoteResponse;
import com.budgetbuddy.infrastructure.news.NewsApiService;
import com.budgetbuddy.infrastructure.news.dto.NewsArticleResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketController {

    private final YahooFinanceService yahooFinanceService;
    private final AwesomeApiService awesomeApiService;
    private final NewsApiService newsApiService;

    @GetMapping("/quote/{ticker}")
    public ResponseEntity<ApiResponse<QuoteResponse>> getQuote(@PathVariable String ticker) {
        return ResponseEntity.ok(ApiResponse.success(yahooFinanceService.getQuote(ticker)));
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
