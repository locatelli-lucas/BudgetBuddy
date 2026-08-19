package com.budgetbuddy.domain.financialinstitution;

import com.budgetbuddy.domain.financialinstitution.dto.FinancialInstitutionRequest;
import com.budgetbuddy.domain.financialinstitution.dto.FinancialInstitutionResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/financial-institutions")
@RequiredArgsConstructor
public class FinancialInstitutionController {

    private final FinancialInstitutionService financialInstitutionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FinancialInstitutionResponse>>> getInstitutions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                financialInstitutionService.getInstitutions(userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FinancialInstitutionResponse>> createInstitution(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FinancialInstitutionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        financialInstitutionService.createInstitution(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInstitution(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        financialInstitutionService.deleteInstitution(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
