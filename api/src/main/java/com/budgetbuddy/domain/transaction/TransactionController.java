package com.budgetbuddy.domain.transaction;

import com.budgetbuddy.domain.transaction.dto.TransactionFilter;
import com.budgetbuddy.domain.transaction.dto.TransactionRequest;
import com.budgetbuddy.domain.transaction.dto.TransactionResponse;
import com.budgetbuddy.domain.transaction.dto.TransactionSummaryResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import com.budgetbuddy.shared.response.PageResponse;
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
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            TransactionFilter filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "date,desc") String[] sort) {
        
        PageResponse<TransactionResponse> response = transactionService.getTransactions(
                userDetails.getUsername(), filter, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getTransaction(userDetails.getUsername(), id)));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecentTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.getRecentTransactions(userDetails.getUsername())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse response = transactionService.createTransaction(userDetails.getUsername(), request);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(transactionService.updateTransaction(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        transactionService.deleteTransaction(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<TransactionSummaryResponse>> getMonthlySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        
        return ResponseEntity.ok(ApiResponse.success(
                transactionService.getMonthlySummary(userDetails.getUsername(), targetMonth, targetYear)));
    }
}
