package com.budgetbuddy.domain.transaction.dto;

import com.budgetbuddy.domain.category.dto.CategoryResponse;
import com.budgetbuddy.domain.financialresource.dto.FinancialResourceResponse;
import com.budgetbuddy.domain.transaction.PaymentMethod;
import com.budgetbuddy.domain.transaction.Transaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private UUID id;
    private CategoryResponse category;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private String notes;
    private FinancialResourceResponse financialResource;
    private PaymentMethod paymentMethod;
    private LocalDate date;
    private boolean isRecurring;
    private String recurrenceRule;
    private LocalDateTime createdAt;
}
