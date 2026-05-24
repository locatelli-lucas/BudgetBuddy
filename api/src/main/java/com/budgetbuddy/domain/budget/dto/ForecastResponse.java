package com.budgetbuddy.domain.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResponse {
    private BigDecimal currentTotalSpent;
    private BigDecimal currentTotalLimit;
    private BigDecimal projectedTotalSpent;
    private BigDecimal averageDailySpend;
    private BigDecimal safeDailySpend;
    private boolean isTrendingToExceed;
}
