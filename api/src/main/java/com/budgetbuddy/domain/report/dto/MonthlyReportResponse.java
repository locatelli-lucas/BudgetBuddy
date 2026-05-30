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
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private BigDecimal savingsRate;
    
    private List<CategoryBreakdown> categories;
    private List<CashFlowPoint> cashFlow;
    
    // Summary provided by AI
    private String aiSummary;
    private List<String> recommendations;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CategoryBreakdown {
    private String name;
    private BigDecimal amount;
    private BigDecimal percentage;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CashFlowPoint {
    private LocalDate date;
    private BigDecimal amount;
}
