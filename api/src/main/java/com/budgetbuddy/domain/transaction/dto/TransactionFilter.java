package com.budgetbuddy.domain.transaction.dto;

import com.budgetbuddy.domain.transaction.Transaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionFilter {
    private TransactionType type;
    private UUID categoryId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String search;
}
