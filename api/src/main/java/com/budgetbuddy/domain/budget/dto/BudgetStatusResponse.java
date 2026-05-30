package com.budgetbuddy.domain.budget.dto;

import com.budgetbuddy.domain.budget.Budget.BudgetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetStatusResponse {
    private UUID id; // Budget ID
    private UUID categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal limit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal percentUsed;
    private BudgetStatus status;
}
