package com.budgetbuddy.domain.news.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AssetNewsOverviewResponse {
    private NewsSentiment overallSentiment;
    private String summary;
    private List<String> mainTopics;
    private List<String> risks;
    private List<String> opportunities;
}
