package com.budgetbuddy.domain.news.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NewsAiSummaryResponse {
    private NewsSentiment sentiment;
    private List<String> keyDevelopments;
    private List<String> risks;
    private List<String> opportunities;
    private String marketImpact;
}
