package com.budgetbuddy.domain.insight;

import com.budgetbuddy.domain.insight.dto.CategorizationRequest;
import com.budgetbuddy.domain.insight.dto.CategorizationResponse;
import com.budgetbuddy.domain.insight.dto.ChatRequest;
import com.budgetbuddy.domain.insight.dto.ChatResponse;
import com.budgetbuddy.domain.insight.dto.InsightResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiInsightService aiInsightService;

    @GetMapping("/insights")
    public ResponseEntity<ApiResponse<List<InsightResponse>>> getInsights(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(aiInsightService.getInsights(userDetails.getUsername())));
    }

    @PostMapping("/insights/refresh")
    public ResponseEntity<ApiResponse<List<InsightResponse>>> refreshInsights(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(aiInsightService.refreshInsights(userDetails.getUsername())));
    }

    @PutMapping("/insights/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        aiInsightService.markAsRead(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/insights/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        aiInsightService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiInsightService.chat(userDetails.getUsername(), request)));
    }

    @PostMapping("/categorize")
    public ResponseEntity<ApiResponse<CategorizationResponse>> categorize(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CategorizationRequest request) {
        return ResponseEntity.ok(ApiResponse.success(aiInsightService.categorize(userDetails.getUsername(), request)));
    }
}
