package com.budgetbuddy.domain.news.dto;

import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Builder
public class NewsArticleResponse {
    private String id;
    private String title;
    private String summary;
    private String source;
    private ZonedDateTime publishedAt;
    private String url;
    private NewsSentiment sentiment;
    private String imageUrl;
}
