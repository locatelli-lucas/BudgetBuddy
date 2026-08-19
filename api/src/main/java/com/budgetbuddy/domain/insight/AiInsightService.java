package com.budgetbuddy.domain.insight;

import com.budgetbuddy.domain.insight.dto.CategorizationRequest;
import com.budgetbuddy.domain.category.Category;
import com.budgetbuddy.domain.category.CategoryRepository;
import com.budgetbuddy.domain.insight.dto.CategorizationRequest;
import com.budgetbuddy.domain.insight.dto.CategorizationResponse;
import com.budgetbuddy.domain.insight.dto.ChatRequest;
import com.budgetbuddy.domain.insight.dto.ChatResponse;
import com.budgetbuddy.domain.insight.dto.InsightResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiInsightService {

    private final AiInsightRepository aiInsightRepository;
    private final UserService userService;
    private final CategoryRepository categoryRepository;
    private final AiProvider aiProvider;

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
        
        // In a real scenario, we would gather the UserFinancialSummary here
        // For now, we use the provider with a mock summary to demonstrate the flow
        UserFinancialSummary summary = UserFinancialSummary.builder()
                .userName(user.getName())
                .monthlyIncome(new BigDecimal("5000.00"))
                .monthlyExpense(new BigDecimal("3500.00"))
                .savingsRate(new BigDecimal("30"))
                .build();
        
        List<AiInsight> insights = aiProvider.generateInsights(summary);
        
        if (insights.isEmpty()) {
            // Fallback mock if AI fails or returns empty
            insights = List.of(AiInsight.builder()
                    .user(user)
                    .type(AiInsight.InsightType.PROGRESS)
                    .title("Ótimo trabalho!")
                    .body("Você economizou 15% a mais neste mês em comparação com o mês anterior.")
                    .icon("trending_up")
                    .severity(AiInsight.InsightSeverity.SUCCESS)
                    .isRead(false)
                    .build());
        } else {
            insights.forEach(insight -> {
                insight.setUser(user);
                aiInsightRepository.save(insight);
            });
        }
                
        return getInsights(email);
    }

    public ChatResponse chat(String email, ChatRequest request) {
        User user = userService.getUserByEmail(email);
        String reply = aiProvider.chat(user.getId().toString(), request.getMessage(), Collections.emptyList());
                
        return ChatResponse.builder()
                .reply(reply)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public CategorizationResponse categorize(String email, CategorizationRequest request) {
        User user = userService.getUserByEmail(email);
        String categoryName = aiProvider.categorize(request.getDescription(), request.getAmount());
        
        UUID categoryId = categoryRepository.findByNameIgnoreCaseAndUserIdOrIsDefaultTrue(categoryName, user.getId())
                .map(Category::getId)
                .orElse(null);

        return CategorizationResponse.builder()
                .suggestedCategoryId(categoryId)
                .categoryName(categoryName)
                .confidence(90)
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
