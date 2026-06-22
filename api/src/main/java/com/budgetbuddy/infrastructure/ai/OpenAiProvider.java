package com.budgetbuddy.infrastructure.ai;

import com.budgetbuddy.domain.insight.AiInsight;
import com.budgetbuddy.infrastructure.ai.dto.ChatMessage;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class OpenAiProvider implements AiProvider {

    @Value("${ai.openai.api-key}")
    private String apiKey;

    @Value("${ai.openai.model}")
    private String model;

    @Override
    public String categorize(String description, BigDecimal amount) {
        // Real implementation would use WebClient to call OpenAI API
        log.info("Mock OpenAI categorizing: {} (R$ {})", description, amount);
        return "Alimentação"; 
    }

    @Override
    public List<AiInsight> generateInsights(UserFinancialSummary summary) {
        log.info("Mock OpenAI generating insights for: {}", summary.getUserName());
        return Collections.emptyList();
    }

    @Override
    public String chat(String userId, String message, List<ChatMessage> history) {
        log.info("Mock OpenAI chat with user: {}", userId);
        return "Olá! Sou seu assistente financeiro alimentado pelo OpenAI GPT-4o-mini.";
    }

    @Override
    public String generateSummary(String prompt) {
        log.info("Mock OpenAI generating summary");
        return """
                {
                  "sentiment": "NEUTRAL",
                  "keyDevelopments": ["Análise OpenAI em andamento"],
                  "risks": [],
                  "opportunities": [],
                  "marketImpact": "Aguardando processamento real."
                }
                """;
    }
}
