package com.budgetbuddy.domain.insight.dto;

import com.budgetbuddy.domain.insight.AiInsight.InsightSeverity;
import com.budgetbuddy.domain.insight.AiInsight.InsightType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightResponse {
    private UUID id;
    private InsightType type;
    private String title;
    private String body;
    private String icon;
    private InsightSeverity severity;
    private UUID referenceId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
