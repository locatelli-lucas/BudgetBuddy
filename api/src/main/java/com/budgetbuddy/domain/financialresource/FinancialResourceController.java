package com.budgetbuddy.domain.financialresource;

import com.budgetbuddy.domain.financialresource.dto.FinancialResourceRequest;
import com.budgetbuddy.domain.financialresource.dto.FinancialResourceResponse;
import com.budgetbuddy.domain.financialresource.dto.GroupedFinancialResourcesResponse;
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
@RequestMapping("/api/v1/financial-resources")
@RequiredArgsConstructor
public class FinancialResourceController {

    private final FinancialResourceService financialResourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FinancialResourceResponse>>> getFinancialResources(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                financialResourceService.getFinancialResources(userDetails.getUsername())));
    }

    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<GroupedFinancialResourcesResponse>> getGroupedFinancialResources(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                financialResourceService.getGroupedFinancialResources(userDetails.getUsername())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialResourceResponse>> getFinancialResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                financialResourceService.getFinancialResource(userDetails.getUsername(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FinancialResourceResponse>> createFinancialResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FinancialResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        financialResourceService.createFinancialResource(userDetails.getUsername(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialResourceResponse>> updateFinancialResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody FinancialResourceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                financialResourceService.updateFinancialResource(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFinancialResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        financialResourceService.deleteFinancialResource(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
