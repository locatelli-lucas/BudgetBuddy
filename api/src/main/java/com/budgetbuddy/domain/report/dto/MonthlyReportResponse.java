package com.budgetbuddy.domain.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyReportResponse {
    private int month;
    private int year;
    private String userName;

    private FinancialSummary summary;
    private ComparisonData comparison;
    private FinancialHealth health;
    
    private List<CategoryBreakdown> categories;
    private List<CashFlowPoint> cashFlow;
    private List<InstitutionGroup> institutions;
    private List<CreditCardData> creditCards;
    private List<InvestmentData> investments;
    private List<InstallmentData> installments;
    private List<FutureCommitment> futureCommitments;
    private List<RecurringCommitment> recurringCommitments;
    private List<HistoricalOutlookPoint> historicalOutlook;
    
    private AiAnalysis aiAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialSummary {
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal netSavings;
        private BigDecimal savingsRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonData {
        private BigDecimal prevMonthIncome;
        private BigDecimal prevMonthExpense;
        private BigDecimal prevMonthSavingsRate;
        private BigDecimal incomeVariation; // percentage
        private BigDecimal expenseVariation; // percentage
        private BigDecimal savingsRateVariation; // percentage points
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialHealth {
        private String savingsRateStatus; // EXCELLENT, GOOD, POOR
        private BigDecimal expenseToIncomeRatio;
        private BigDecimal creditUtilizationRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String name;
        private BigDecimal amount;
        private BigDecimal percentage;
        private String color;
        private String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowPoint {
        private LocalDate date;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditCardData {
        private String name;
        private String brand;
        private BigDecimal limit;
        private BigDecimal currentBalance;
        private BigDecimal utilizationPercentage;
        private int dueDay;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvestmentData {
        private String type; // STOCK, FII, etc.
        private BigDecimal totalValue;
        private BigDecimal percentageOfPortfolio;
        private BigDecimal monthlyReturn; // if available
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstallmentData {
        private String description;
        private BigDecimal totalAmount;
        private int currentInstallment;
        private int totalInstallments;
        private BigDecimal installmentAmount;
        private LocalDate nextDueDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FutureCommitment {
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String type; // FIXED_EXPENSE, INSTALLMENT
        private boolean isRecurring;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecurringCommitment {
        private String description;
        private BigDecimal amount;
        private String category;
        private String frequency; // Monthly, Weekly, etc.
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstitutionGroup {
        private String name;
        private String icon;
        private BigDecimal totalBalance;
        private List<ResourceSummary> resources;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class ResourceSummary {
            private String name;
            private String type;
            private BigDecimal balance;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoricalOutlookPoint {
        private String label; // Month/Year
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal savingsRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiAnalysis {
        private String executiveSummary;
        private List<InsightItem> topInsights;
        private List<String> strengths;
        private List<String> attentionPoints;
        private List<String> recommendations;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class InsightItem {
            private String title;
            private String description;
        }
    }
}
