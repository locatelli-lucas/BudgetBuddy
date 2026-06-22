package com.budgetbuddy.domain.news.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
public class NewsArticleAnalysisResponse {
    private String title;
    private String source;
    private String url;
    private ZonedDateTime publishedAt;
    private String articleContent;
    private String aiSummary;
    private NewsSentiment sentiment;
    private List<String> opportunities;
    private List<String> risks;
    private String marketImpact;
}
