package com.budgetbuddy.domain.insight;

import com.budgetbuddy.domain.insight.dto.CategorizationRequest;
import com.budgetbuddy.domain.insight.dto.CategorizationResponse;
import com.budgetbuddy.domain.insight.dto.ChatRequest;
import com.budgetbuddy.domain.insight.dto.ChatResponse;
import com.budgetbuddy.domain.insight.dto.InsightResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final AiInsightRepository aiInsightRepository;
    private final UserService userService;
    // Will be injected later: private final AiProvider aiProvider;

    @Transactional(readOnly = true)
    @Cacheable(value = "userInsights", key = "#email")
    public List<InsightResponse> getInsights(String email) {
        User user = userService.getUserByEmail(email);
        List<AiInsight> insights = aiInsightRepository.findTop20ByUserIdOrderByCreatedAtDesc(user.getId());
        return insights.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "userInsights", key = "#email")
    public void markAsRead(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        AiInsight insight = aiInsightRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Insight", id.toString()));
        insight.setRead(true);
        aiInsightRepository.save(insight);
    }

    @Transactional
    @CacheEvict(value = "userInsights", key = "#email")
    public void markAllAsRead(String email) {
        User user = userService.getUserByEmail(email);
        aiInsightRepository.markAllAsReadForUser(user.getId());
    }

    @Transactional
    @CacheEvict(value = "userInsights", key = "#email")
    public List<InsightResponse> refreshInsights(String email) {
        User user = userService.getUserByEmail(email);
        
        // In Phase 4, this will trigger the AiProvider to analyze recent data and generate new insights
        // For now, we mock a generation
        
        AiInsight mockInsight = AiInsight.builder()
                .user(user)
                .type(AiInsight.InsightType.PROGRESS)
                .title("Ótimo trabalho!")
                .body("Você economizou 15% a mais neste mês em comparação com o mês anterior.")
                .icon("trending_up")
                .severity(AiInsight.InsightSeverity.SUCCESS)
                .isRead(false)
                .build();
                
        aiInsightRepository.save(mockInsight);
        
        return getInsights(email);
    }

    public ChatResponse chat(String email, ChatRequest request) {
        // In Phase 4, this calls the AiProvider
        String mockReply = "Como assistente financeiro, percebo que você está perguntando sobre: " + request.getMessage() 
                + ". No momento, estou em fase de treinamento.";
                
        return ChatResponse.builder()
                .reply(mockReply)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public CategorizationResponse categorize(String email, CategorizationRequest request) {
        // In Phase 4, this calls the AiProvider
        return CategorizationResponse.builder()
                .suggestedCategoryId(null) // Mock: would return an actual UUID
                .categoryName("Outros")
                .confidence(85)
                .build();
    }

    private InsightResponse mapToResponse(AiInsight insight) {
        return InsightResponse.builder()
                .id(insight.getId())
                .type(insight.getType())
                .title(insight.getTitle())
                .body(insight.getBody())
                .icon(insight.getIcon())
                .severity(insight.getSeverity())
                .referenceId(insight.getReferenceId())
                .isRead(insight.isRead())
                .createdAt(insight.getCreatedAt())
                .build();
    }
}
