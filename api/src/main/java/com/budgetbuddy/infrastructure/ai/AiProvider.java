package com.budgetbuddy.infrastructure.ai;

import com.budgetbuddy.domain.insight.AiInsight;
import com.budgetbuddy.infrastructure.ai.dto.ChatMessage;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;

import java.math.BigDecimal;
import java.util.List;

public interface AiProvider {
    
    /**
     * Categorizes a transaction description.
     */
    String categorize(String description, BigDecimal amount);
    
    /**
     * Generates personalized financial insights based on the user's data.
     */
    List<AiInsight> generateInsights(UserFinancialSummary summary);
    
    /**
     * Chat interface for the AI financial assistant.
     */
    String chat(String userId, String message, List<ChatMessage> history);

    /**
     * Generates a structured summary of news articles.
     */
    String generateSummary(String prompt);
}
