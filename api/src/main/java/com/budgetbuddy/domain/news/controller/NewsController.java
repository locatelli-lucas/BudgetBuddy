package com.budgetbuddy.domain.news.controller;

import com.budgetbuddy.domain.news.dto.AssetNewsOverviewResponse;
import com.budgetbuddy.domain.news.dto.NewsAiSummaryResponse;
import com.budgetbuddy.domain.news.dto.NewsArticleAnalysisResponse;
import com.budgetbuddy.domain.news.dto.NewsArticleResponse;
import com.budgetbuddy.domain.news.service.NewsService;
import com.budgetbuddy.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/asset/{symbol}")
    public ResponseEntity<ApiResponse<List<NewsArticleResponse>>> getAssetNews(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<NewsArticleResponse> news = newsService.getAssetNews(symbol, page, size);
        return ResponseEntity.ok(ApiResponse.success(news));
    }

    @PostMapping("/asset/{symbol}/summary")
    public ResponseEntity<ApiResponse<NewsAiSummaryResponse>> getAssetSummary(@PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success(newsService.generateAiSummary(symbol)));
    }

    @GetMapping("/article/analysis")
    public ResponseEntity<ApiResponse<NewsArticleAnalysisResponse>> analyzeArticle(
            @RequestParam String url,
            @RequestParam String symbol,
            @RequestParam String title,
            @RequestParam String source,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime publishedAt) {
        
        NewsArticleAnalysisResponse analysis = newsService.analyzeArticle(url, symbol, title, source, publishedAt);
        if (analysis == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }

    @PostMapping("/asset/{symbol}/overview")
    public ResponseEntity<ApiResponse<AssetNewsOverviewResponse>> getAssetOverview(@PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success(newsService.getAssetOverview(symbol)));
    }
}
