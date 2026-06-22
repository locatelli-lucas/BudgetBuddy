package com.budgetbuddy.domain.news.controller;

import com.budgetbuddy.domain.news.dto.NewsAiSummaryResponse;
import com.budgetbuddy.domain.news.dto.NewsArticleResponse;
import com.budgetbuddy.domain.news.service.NewsService;
import com.budgetbuddy.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
