package com.budgetbuddy.infrastructure.ai;

import com.budgetbuddy.domain.insight.AiInsight;
import com.budgetbuddy.infrastructure.ai.dto.ChatMessage;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GroqAiProvider implements AiProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final PromptLoader promptLoader;
    private final String model;
    private String apiKey;

    public GroqAiProvider(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            PromptLoader promptLoader,
            @Value("${ai.groq.base-url:https://api.groq.com/openai/v1}") String baseUrl,
            @Value("${ai.groq.api-key:}") String apiKey,
            @Value("${ai.groq.model:llama-3.3-70b-versatile}") String model) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
        this.promptLoader = promptLoader;
        this.apiKey = apiKey;
        this.model = model;
    }

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("${")) {
            log.info("Spring failed to inject GROQ_API_KEY. Attempting manual load from .env file...");
            try {
                Dotenv dotenv = Dotenv.configure()
                        .directory("./api")
                        .ignoreIfMissing()
                        .load();
                
                String envKey = dotenv.get("GROQ_API_KEY");
                if (envKey == null) {
                    dotenv = Dotenv.configure().ignoreIfMissing().load();
                    envKey = dotenv.get("GROQ_API_KEY");
                }
                
                if (envKey != null && !envKey.isBlank()) {
                    this.apiKey = envKey;
                    log.info("Successfully loaded GROQ_API_KEY manually via Dotenv.");
                }
            } catch (Exception e) {
                log.warn("Manual .env loading failed for Groq: {}", e.getMessage());
            }
        }
        
        if (apiKey != null && !apiKey.isBlank()) {
            String maskedKey = apiKey.substring(0, Math.min(apiKey.length(), 4)) + "..." + 
                               apiKey.substring(Math.max(0, apiKey.length() - 4));
            log.info("GroqAiProvider initialized with model: {} and API key: {}", model, maskedKey);
        } else {
            log.error("CRITICAL: GROQ_API_KEY is not set correctly. AI features will not work.");
        }
    }

    @Override
    public String categorize(String description, BigDecimal amount) {
        String prompt = promptLoader.load("categorization", Map.of(
                "description", description,
                "amount", amount
        ));
        return callGroq(null, prompt);
    }

    @Override
    public List<AiInsight> generateInsights(UserFinancialSummary summary) {
        String prompt = promptLoader.load("financial-insights", Map.of(
                "userName", summary.getUserName(),
                "monthlyIncome", summary.getMonthlyIncome(),
                "monthlyExpense", summary.getMonthlyExpense(),
                "savingsRate", summary.getSavingsRate()
        ));

        try {
            String response = callGroq(null, prompt);
            JsonNode root = objectMapper.readTree(cleanJsonResponse(response));
            List<AiInsight> insights = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    insights.add(mapJsonToInsight(node));
                }
            }
            return insights;
        } catch (Exception e) {
            log.error("Error generating insights with Groq", e);
            return Collections.emptyList();
        }
    }

    @Override
    public String chat(String userId, String message, List<ChatMessage> history) {
        String systemPrompt = promptLoader.load("chat-system", Collections.emptyMap());
        
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        
        for (ChatMessage msg : history) {
            messages.add(Map.of("role", msg.getRole().toLowerCase(), "content", msg.getContent()));
        }
        
        messages.add(Map.of("role", "user", "content", message));
        
        return callGroqInternal(messages);
    }

    @Override
    public String summarize(String content) {
        String prompt = promptLoader.load("news-summary", Map.of("content", content));
        return callGroq(null, prompt);
    }

    @Override
    public String generateSummary(String prompt) {
        return callGroq(null, prompt);
    }

    @Override
    public String generateMonthlyReport(UserFinancialSummary data) {
        String prompt = promptLoader.load("monthly-report", Map.of(
                "userName", data.getUserName(),
                "monthlyIncome", data.getMonthlyIncome(),
                "monthlyExpense", data.getMonthlyExpense(),
                "netSavings", data.getMonthlyIncome().subtract(data.getMonthlyExpense()),
                "savingsRate", data.getSavingsRate()
        ));
        return callGroq(null, prompt);
    }

    @Override
    public String analyze(String type, String data) {
        String promptTemplate = switch (type.toLowerCase()) {
            case "portfolio" -> "portfolio-analysis";
            case "spending" -> "expense-analysis";
            default -> throw new IllegalArgumentException("Unknown analysis type: " + type);
        };
        
        String prompt = promptLoader.load(promptTemplate, Map.of("data", data));
        return callGroq(null, prompt);
    }

    private String callGroq(String systemPrompt, String userPrompt) {
        List<Map<String, String>> messages = new ArrayList<>();
        if (systemPrompt != null) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
        messages.add(Map.of("role", "user", "content", userPrompt));
        return callGroqInternal(messages);
    }

    private String callGroqInternal(List<Map<String, String>> messages) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("GROQ_API_KEY is not set.");
            throw new RuntimeException("AI Provider not configured: Missing Groq API Key");
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7
        );

        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                    response.bodyToMono(String.class).flatMap(errorBody -> {
                        log.error("Groq API Error: Status Code: {}, Body: {}", response.statusCode(), errorBody);
                        if (response.statusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                            return Mono.error(new RuntimeException("Groq rate limit exceeded"));
                        }
                        return Mono.error(new RuntimeException("Groq API Error: " + response.statusCode()));
                    })
                )
                .bodyToMono(JsonNode.class)
                .map(json -> json.path("choices").get(0).path("message").path("content").asText())
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                        .filter(throwable -> throwable.getMessage().contains("rate limit") || 
                                            throwable.getMessage().contains("5xx") ||
                                            throwable instanceof java.io.IOException))
                .block();
    }

    private String cleanJsonResponse(String response) {
        return response.replaceAll("```json", "").replaceAll("```", "").trim();
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
