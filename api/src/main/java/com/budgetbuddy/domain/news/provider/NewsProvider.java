package com.budgetbuddy.domain.news.provider;

import com.budgetbuddy.domain.news.dto.NewsArticleResponse;

import java.util.List;

public interface NewsProvider {
    List<NewsArticleResponse> getAssetNews(String symbol, String query, int page, int size);
}
