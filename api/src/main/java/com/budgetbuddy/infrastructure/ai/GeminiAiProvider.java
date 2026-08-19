package com.budgetbuddy.infrastructure.ai;

import com.budgetbuddy.domain.insight.AiInsight;
import com.budgetbuddy.infrastructure.ai.dto.ChatMessage;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import io.github.cdimascio.dotenv.Dotenv;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
public class GeminiAiProvider implements AiProvider {

    static {
        log.info("!!!!! CLASS LOADED: GeminiAiProvider class is being loaded by the JVM !!!!!");
    }

    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private Client client;

    public GeminiAiProvider(
            ObjectMapper objectMapper,
            @Value("${ai.gemini.api-key:}") String apiKey,
            @Value("${ai.gemini.model:}") String model) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
        
        log.info("!!!!! CONSTRUCTOR EXECUTED !!!!! Instance: {}. Key: '{}'. Model: '{}'", 
                 System.identityHashCode(this), 
                 (apiKey == null ? "null" : (apiKey.isBlank() ? "BLANK" : "HAS_VALUE")), 
                 model);
        
        initializeClient();
    }

    private void initializeClient() {
        String finalKey = apiKey;
        
        // Fallback: If Spring injection failed (empty string), try loading manually with Dotenv
        if (finalKey == null || finalKey.isBlank() || finalKey.startsWith("${")) {
            log.info("Spring failed to inject GEMINI_API_KEY. Attempting manual load from .env file...");
            try {
                // Try to load .env from common locations
                Dotenv dotenv = Dotenv.configure()
                        .directory("./api") // Try from root
                        .ignoreIfMissing()
                        .load();
                
                String envKey = dotenv.get("GEMINI_API_KEY");
                if (envKey == null) {
                    dotenv = Dotenv.configure().ignoreIfMissing().load(); // Try from current dir
                    envKey = dotenv.get("GEMINI_API_KEY");
                }
                
                if (envKey != null && !envKey.isBlank()) {
                    finalKey = envKey;
                    log.info("Successfully loaded GEMINI_API_KEY manually via Dotenv.");
                }
            } catch (Exception e) {
                log.warn("Manual .env loading failed: {}", e.getMessage());
            }
        }

        if (finalKey == null || finalKey.isBlank() || finalKey.startsWith("${")) {
            log.error("CRITICAL: GEMINI_API_KEY is still not configured. Value: '{}'.", finalKey);
            return;
        }

        try {
            this.client = Client.builder().apiKey(finalKey).build();
            String maskedKey = finalKey.substring(0, Math.min(finalKey.length(), 4)) + "..." + 
                               finalKey.substring(Math.max(0, finalKey.length() - 4));
            log.info("GeminiAiProvider successfully initialized. Key: {}", maskedKey);
        } catch (Exception e) {
            log.error("Failed to initialize Gemini Client: {}", e.getMessage());
        }
    }

    @PostConstruct
    public void verify() {
        log.info("GeminiAiProvider @PostConstruct verify. Instance: {}, Client initialized: {}", 
                 System.identityHashCode(this), (client != null));
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
            return "Desculpe, tive um problema ao processar sua solicitação. Verifique se a chave da API do Gemini está configurada corretamente.";
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
        log.info("callGemini() called on instance: {}. Client status: {}", 
                 System.identityHashCode(this), (client != null ? "INITIALIZED" : "NULL"));

        if (client == null) {
            log.error("CRITICAL: Attempted to call Gemini on instance {} but client is null. API Key in memory: {}", 
                      System.identityHashCode(this), (apiKey != null ? "PRESENT" : "NULL"));
            throw new RuntimeException("Gemini client not initialized. Check your GEMINI_API_KEY configuration.");
        }
        
        log.debug("Calling Gemini API with prompt: {}", prompt);
        
        try {
            GenerateContentResponse response = client.models.generateContent(model, prompt, null);
            String text = response.text();
            
            if (text == null || text.isBlank()) {
                log.warn("Gemini returned empty text for prompt: {}", prompt);
                throw new RuntimeException("Empty response from Gemini");
            }
            
            return text;
        } catch (Exception e) {
            log.error("Gemini API Error: {}", e.getMessage());
            throw new RuntimeException("Gemini API Error: " + e.getMessage(), e);
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
