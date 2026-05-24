package com.budgetbuddy.infrastructure.news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleResponse {
    private String title;
    private String description;
    private String url;
    private String source;
    private String publishedAt;
}
