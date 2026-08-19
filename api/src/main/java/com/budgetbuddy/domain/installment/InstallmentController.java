package com.budgetbuddy.domain.installment;

import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseRequest;
import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/installments")
@RequiredArgsConstructor
public class InstallmentController {

    private final InstallmentService installmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InstallmentPurchaseResponse>>> getInstallmentPurchases(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.getInstallmentPurchases(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InstallmentPurchaseResponse>> getInstallmentPurchase(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.getInstallmentPurchase(userDetails.getUsername(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InstallmentPurchaseResponse>> createInstallmentPurchase(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InstallmentPurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        installmentService.createInstallmentPurchase(userDetails.getUsername(), request)));
    }
}
