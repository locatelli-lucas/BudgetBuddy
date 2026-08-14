package com.budgetbuddy.infrastructure.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiReportAnalysis {
    private String executiveSummary;
    private List<InsightItem> topInsights;
    private List<String> strengths;
    private List<String> attentionPoints;
    private List<String> recommendations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsightItem {
        private String title;
        private String description;
    }
}
