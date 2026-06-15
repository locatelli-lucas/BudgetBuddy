package com.budgetbuddy.domain.institution;

import com.budgetbuddy.domain.institution.dto.InstitutionRequest;
import com.budgetbuddy.domain.institution.dto.InstitutionResponse;
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
@RequestMapping("/api/v1/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InstitutionResponse>>> getInstitutions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                institutionService.getInstitutions(userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InstitutionResponse>> createInstitution(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InstitutionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        institutionService.createInstitution(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInstitution(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        institutionService.deleteInstitution(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
