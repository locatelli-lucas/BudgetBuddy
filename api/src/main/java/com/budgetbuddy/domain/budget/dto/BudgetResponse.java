package com.budgetbuddy.domain.budget.dto;

import com.budgetbuddy.domain.category.dto.CategoryResponse;
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
public class BudgetResponse {
    private UUID id;
    private CategoryResponse category;
    private int month;
    private int year;
    private BigDecimal limitAmount;
}
