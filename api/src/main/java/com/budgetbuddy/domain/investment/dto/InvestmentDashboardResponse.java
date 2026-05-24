package com.budgetbuddy.domain.investment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentDashboardResponse {
    private BigDecimal totalInvested;
    private BigDecimal currentTotalValue;
    private BigDecimal netProfitLoss;
    private BigDecimal returnPercent;
}
