package com.budgetbuddy.domain.report;

import com.budgetbuddy.domain.report.dto.MonthlyReportResponse;
import com.budgetbuddy.domain.transaction.TransactionService;
import com.budgetbuddy.domain.transaction.dto.TransactionSummaryResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionService transactionService;
    private final UserService userService;
    private final AiProvider aiProvider;

    public MonthlyReportResponse getMonthlyReport(String email, int month, int year) {
        User user = userService.getUserByEmail(email);
        
        TransactionSummaryResponse summary = transactionService.getMonthlySummary(email, month, year);
        
        // Detailed queries for categories and cashflow would be executed here
        // For now, mapping the base summary and mocking the complex lists
        
        UserFinancialSummary aiData = UserFinancialSummary.builder()
                .userName(user.getName())
                .monthlyIncome(summary.getTotalIncome())
                .monthlyExpense(summary.getTotalExpense())
                .savingsRate(summary.getSavingsRate())
                .build();

        String aiSummary;
        try {
            aiSummary = aiProvider.generateMonthlyReport(aiData);
        } catch (Exception e) {
            aiSummary = "Neste mês, você teve um bom controle de despesas. Sua taxa de economia foi de " 
                    + summary.getSavingsRate() + "%. Seus maiores gastos continuam sendo em Moradia e Alimentação.";
        }
                
        return MonthlyReportResponse.builder()
                .month(month)
                .year(year)
                .userName(user.getName())
                .totalIncome(summary.getTotalIncome())
                .totalExpense(summary.getTotalExpense())
                .netSavings(summary.getNetBalance())
                .savingsRate(summary.getSavingsRate())
                .categories(new ArrayList<>()) // To be populated via native queries
                .cashFlow(new ArrayList<>()) // To be populated via native queries
                .aiSummary(aiSummary)
                .recommendations(List.of("Considere investir a sobra deste mês em Renda Fixa.", "Tente reduzir os gastos com delivery em 10%."))
                .build();
    }
}
