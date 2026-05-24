package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.investment.dto.InvestmentDashboardResponse;
import com.budgetbuddy.domain.investment.dto.InvestmentRequest;
import com.budgetbuddy.domain.investment.dto.InvestmentResponse;
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
@RequestMapping("/api/v1/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentService investmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InvestmentResponse>>> getInvestments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(investmentService.getInvestments(userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InvestmentResponse>> addInvestment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InvestmentRequest request) {
        InvestmentResponse response = investmentService.addInvestment(userDetails.getUsername(), request);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InvestmentResponse>> updateInvestment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody InvestmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(investmentService.updateInvestment(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInvestment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        investmentService.deleteInvestment(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<InvestmentDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(investmentService.getDashboard(userDetails.getUsername())));
    }
}
