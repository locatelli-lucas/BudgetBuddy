package com.budgetbuddy.infrastructure.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFinancialSummary {
    private String userName;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal savingsRate;
    private Map<String, BigDecimal> expensesByCategory;
    private Map<String, BigDecimal> budgetStatus; // Category -> % used
}
