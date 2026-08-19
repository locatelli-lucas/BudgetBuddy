package com.budgetbuddy.infrastructure.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
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
    
    // New fields for professional report
    private BigDecimal previousMonthExpense;
    private List<CreditCardSummary> creditCards;
    private List<InvestmentSummary> investments;
    private List<InstallmentSummary> upcomingInstallments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditCardSummary {
        private String name;
        private BigDecimal limit;
        private BigDecimal balance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvestmentSummary {
        private String type;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstallmentSummary {
        private String description;
        private BigDecimal amount;
        private int remainingInstallments;
    }
}
