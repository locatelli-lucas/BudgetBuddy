package com.budgetbuddy.domain.goal;

import com.budgetbuddy.domain.goal.dto.GoalRequest;
import com.budgetbuddy.domain.goal.dto.GoalResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(goalService.getGoals(userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody GoalRequest request) {
        return new ResponseEntity<>(ApiResponse.success(goalService.createGoal(userDetails.getUsername(), request)), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody GoalRequest request) {
        return ResponseEntity.ok(ApiResponse.success(goalService.updateGoal(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        goalService.deleteGoal(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
