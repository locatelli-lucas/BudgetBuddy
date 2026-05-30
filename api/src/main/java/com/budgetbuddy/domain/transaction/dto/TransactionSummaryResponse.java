package com.budgetbuddy.domain.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummaryResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private BigDecimal savingsRate;
}
