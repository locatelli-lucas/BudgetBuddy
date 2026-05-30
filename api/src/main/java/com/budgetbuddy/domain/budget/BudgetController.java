package com.budgetbuddy.domain.budget;

import com.budgetbuddy.domain.budget.dto.BudgetRequest;
import com.budgetbuddy.domain.budget.dto.BudgetResponse;
import com.budgetbuddy.domain.budget.dto.BudgetStatusResponse;
import com.budgetbuddy.domain.budget.dto.ForecastResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
            
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        
        return ResponseEntity.ok(ApiResponse.success(
                budgetService.getBudgets(userDetails.getUsername(), targetMonth, targetYear)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse response = budgetService.createBudget(userDetails.getUsername(), request);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(ApiResponse.success(budgetService.updateBudget(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        budgetService.deleteBudget(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<BudgetStatusResponse>>> getBudgetStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
            
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        
        return ResponseEntity.ok(ApiResponse.success(
                budgetService.getBudgetStatus(userDetails.getUsername(), targetMonth, targetYear)));
    }

    @GetMapping("/forecast")
    public ResponseEntity<ApiResponse<ForecastResponse>> getForecast(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
            
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        
        return ResponseEntity.ok(ApiResponse.success(
                budgetService.getForecast(userDetails.getUsername(), targetMonth, targetYear)));
    }
}
