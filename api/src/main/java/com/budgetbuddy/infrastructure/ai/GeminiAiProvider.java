package com.budgetbuddy.infrastructure.ai;

import com.budgetbuddy.domain.insight.AiInsight;
import com.budgetbuddy.infrastructure.ai.dto.ChatMessage;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GeminiAiProvider implements AiProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    @Value("${ai.gemini.model}")
    private String model;

    public GeminiAiProvider(WebClient.Builder webClientBuilder, ObjectMapper objectMapper,
                            @Value("${ai.gemini.base-url}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("${")) {
            log.warn("GEMINI_API_KEY is not set correctly. AI features will not work.");
        } else {
            String maskedKey = apiKey.substring(0, Math.min(apiKey.length(), 4)) + "..." + 
                               apiKey.substring(Math.max(0, apiKey.length() - 4));
            log.info("GeminiAiProvider initialized with model: {} and API key: {}", model, maskedKey);
        }
    }

    @Override
    public String categorize(String description, BigDecimal amount) {
        log.info("Gemini categorizing: {} (R$ {})", description, amount);
        
        String prompt = String.format(
            "Categorize esta transação financeira: Descrição: '%s', Valor: R$ %s. " +
            "Responda apenas com o nome da categoria mais adequada (ex: Alimentação, Transporte, Lazer, Saúde, Educação, Moradia, Outros).",
            description, amount
        );

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            log.error("Failed to categorize transaction: {}", e.getMessage());
            return "Outros";
        }
    }

    @Override
    public List<AiInsight> generateInsights(UserFinancialSummary summary) {
        log.info("Gemini generating insights for: {}", summary.getUserName());
        
        String prompt = String.format(
            "Atue como um consultor financeiro pessoal. Analise os seguintes dados do usuário %s: " +
            "Renda mensal: R$ %s, Gastos no mês: R$ %s, Taxa de economia: %s%%. " +
            "Gere 3 insights financeiros acionáveis em formato JSON. " +
            "Cada insight deve ter: 'title', 'body', 'type' (TIPS, WARNING, PROGRESS), " +
            "'icon' (material design icon name), 'severity' (INFO, WARNING, ERROR, SUCCESS).",
            summary.getUserName(), summary.getMonthlyIncome(), summary.getMonthlyExpense(), summary.getSavingsRate()
        );

        try {
            String response = callGemini(prompt);
            JsonNode root = objectMapper.readTree(response);
            List<AiInsight> insights = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    insights.add(mapJsonToInsight(node));
                }
            }
            return insights;
        } catch (Exception e) {
            log.error("Error generating or parsing Gemini insights: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String chat(String userId, String message, List<ChatMessage> history) {
        log.info("Gemini chat with user: {}", userId);
        
        StringBuilder context = new StringBuilder("Você é o BudgetBuddy AI, um assistente financeiro amigável. Contexto da conversa:\n");
        for (ChatMessage msg : history) {
            context.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
        }
        context.append("Usuário: ").append(message);
        
        try {
            return callGemini(context.toString());
        } catch (Exception e) {
            log.error("Gemini chat error: {}", e.getMessage());
            return "Desculpe, tive um problema ao processar sua solicitação. Por favor, tente novamente mais tarde.";
        }
    }

    @Override
    public String generateSummary(String prompt) {
        log.info("Gemini generating summary");
        try {
            return callGemini(prompt + "\nResponda em formato JSON com campos: sentiment, keyDevelopments, risks, opportunities, marketImpact.");
        } catch (Exception e) {
            log.error("Failed to generate summary: {}", e.getMessage());
            return "{}";
        }
    }

    private String callGemini(String prompt) {
        log.debug("Calling Gemini API with prompt: {}", prompt);
        
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));

        String responseBody = webClient.post()
            .uri(uriBuilder -> uriBuilder
                .path("/models/" + model + ":generateContent")
                .queryParam("key", apiKey)
                .build())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(requestBody)
            .retrieve()
            .onStatus(status -> status.isError(), response -> 
                response.bodyToMono(String.class).flatMap(errorBody -> {
                    log.error("Gemini API Error: Status Code: {}, Body: {}", response.statusCode(), errorBody);
                    return Mono.error(new RuntimeException("Gemini API Error: " + response.statusCode()));
                })
            )
            .bodyToMono(String.class)
            .block();

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            
            if (textNode.isMissingNode()) {
                log.warn("Gemini returned empty or unexpected structure: {}", responseBody);
                throw new RuntimeException("Unexpected response structure from Gemini");
            }
            
            return textNode.asText();
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            throw new RuntimeException("Error processing Gemini response", e);
        }
    }

    private AiInsight mapJsonToInsight(JsonNode node) {
        return AiInsight.builder()
                .title(node.path("title").asText("Dica Financeira"))
                .body(node.path("body").asText())
                .type(AiInsight.InsightType.valueOf(node.path("type").asText("TIPS")))
                .icon(node.path("icon").asText("lightbulb"))
                .severity(AiInsight.InsightSeverity.valueOf(node.path("severity").asText("INFO")))
                .isRead(false)
                .build();
    }
}
