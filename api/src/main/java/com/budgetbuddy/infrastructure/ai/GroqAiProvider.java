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
public class GroqAiProvider implements AiProvider {

    @Value("${ai.groq.api-key}")
    private String apiKey;

    @Value("${ai.groq.model}")
    private String model;

    @Override
    public String categorize(String description, BigDecimal amount) {
        log.info("Mock Groq categorizing: {} (R$ {})", description, amount);
        return "Alimentação";
    }

    @Override
    public List<AiInsight> generateInsights(UserFinancialSummary summary) {
        log.info("Mock Groq generating insights for: {}", summary.getUserName());
        return Collections.emptyList();
    }

    @Override
    public String chat(String userId, String message, List<ChatMessage> history) {
        log.info("Mock Groq chat with user: {}", userId);
        return "Olá! Sou seu assistente financeiro alimentado pelo Groq Llama-3.1.";
    }

    @Override
    public String generateSummary(String prompt) {
        log.info("Mock Groq generating summary");
        return """
                {
                  "sentiment": "POSITIVE",
                  "keyDevelopments": ["Exemplo de desenvolvimento positivo 1", "Exemplo de desenvolvimento positivo 2"],
                  "risks": ["Risco de exemplo 1"],
                  "opportunities": ["Oportunidade de exemplo 1"],
                  "marketImpact": "Impacto positivo esperado no curto prazo."
                }
                """;
    }
}
