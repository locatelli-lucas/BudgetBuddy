package com.budgetbuddy.domain.report;

import com.budgetbuddy.domain.budget.BudgetService;
import com.budgetbuddy.domain.budget.dto.BudgetStatusResponse;
import com.budgetbuddy.domain.financialresource.FinancialResourceService;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import com.budgetbuddy.domain.financialresource.dto.FinancialResourceResponse;
import com.budgetbuddy.domain.installment.InstallmentService;
import com.budgetbuddy.domain.installment.dto.InstallmentPurchaseResponse;
import com.budgetbuddy.domain.investment.InvestmentService;
import com.budgetbuddy.domain.investment.dto.InvestmentResponse;
import com.budgetbuddy.domain.report.dto.MonthlyReportResponse;
import com.budgetbuddy.domain.transaction.TransactionRepository;
import com.budgetbuddy.domain.transaction.TransactionService;
import com.budgetbuddy.domain.transaction.dto.TransactionSummaryResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.infrastructure.ai.AiProvider;
import com.budgetbuddy.infrastructure.ai.dto.AiReportAnalysis;
import com.budgetbuddy.infrastructure.ai.dto.UserFinancialSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private final BudgetService budgetService;
    private final InvestmentService investmentService;
    private final InstallmentService installmentService;
    private final FinancialResourceService financialResourceService;
    private final AiProvider aiProvider;

    public MonthlyReportResponse getMonthlyReport(String email, int month, int year) {
        User user = userService.getUserByEmail(email);
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        
        // 1. Summaries
        TransactionSummaryResponse currentSummary = transactionService.getMonthlySummary(email, month, year);
        
        LocalDate prevMonthDate = start.minusMonths(1);
        TransactionSummaryResponse prevSummary = transactionService.getMonthlySummary(email, prevMonthDate.getMonthValue(), prevMonthDate.getYear());
        
        // Debug logs to trace comparison issues
        log.info("Report for {}/{} (Current: Income={}, Expense={}) vs Previous {}/{} (Income={}, Expense={})", 
                month, year, currentSummary.getTotalIncome(), currentSummary.getTotalExpense(),
                prevMonthDate.getMonthValue(), prevMonthDate.getYear(), prevSummary.getTotalIncome(), prevSummary.getTotalExpense());

        // 2. Category Aggregation
        List<Object[]> categoryData = transactionRepository.aggregateExpensesByCategory(user.getId(), start, end);
        List<MonthlyReportResponse.CategoryBreakdown> categories = categoryData.stream()
                .map(row -> MonthlyReportResponse.CategoryBreakdown.builder()
                        .name((String) row[0])
                        .amount((BigDecimal) row[1])
                        .percentage(calculatePercentage((BigDecimal) row[1], currentSummary.getTotalExpense()))
                        .color((String) row[2])
                        .icon((String) row[3])
                        .build())
                .sorted((a, b) -> b.getAmount().compareTo(a.getAmount()))
                .collect(Collectors.toList());

        // 3. Cash Flow
        List<Object[]> cashFlowData = transactionRepository.aggregateDailyCashFlow(user.getId(), start, end);
        List<MonthlyReportResponse.CashFlowPoint> cashFlow = cashFlowData.stream()
                .map(row -> MonthlyReportResponse.CashFlowPoint.builder()
                        .date((LocalDate) row[0])
                        .amount((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());

        // 4. Financial Resources (Grouped by Institution)
        List<FinancialResourceResponse> allResources = financialResourceService.getFinancialResources(email);
        
        Map<String, List<FinancialResourceResponse>> resourcesByInstitution = allResources.stream()
                .collect(Collectors.groupingBy(r -> r.getFinancialInstitution() != null ? r.getFinancialInstitution().getName() : "Outros"));

        List<MonthlyReportResponse.InstitutionGroup> institutions = resourcesByInstitution.entrySet().stream()
                .map(entry -> {
                    String institutionName = entry.getKey();
                    List<FinancialResourceResponse> resList = entry.getValue();
                    BigDecimal total = resList.stream()
                            .map(r -> r.getCurrentBalance() != null ? r.getCurrentBalance() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    String icon = resList.stream()
                            .filter(r -> r.getFinancialInstitution() != null && r.getFinancialInstitution().getLogoUrl() != null)
                            .map(r -> r.getFinancialInstitution().getLogoUrl())
                            .findFirst().orElse(null);

                    return MonthlyReportResponse.InstitutionGroup.builder()
                            .name(institutionName)
                            .icon(icon)
                            .totalBalance(total)
                            .resources(resList.stream()
                                    .map(r -> MonthlyReportResponse.InstitutionGroup.ResourceSummary.builder()
                                            .name(r.getName())
                                            .type(r.getType().name())
                                            .balance(r.getCurrentBalance())
                                            .build())
                                    .collect(Collectors.toList()))
                            .build();
                })
                .sorted((a, b) -> b.getTotalBalance().compareTo(a.getTotalBalance()))
                .collect(Collectors.toList());

        List<MonthlyReportResponse.CreditCardData> creditCards = allResources.stream()
                .filter(r -> r.getType() == FinancialResourceType.CREDIT_CARD)
                .map(r -> MonthlyReportResponse.CreditCardData.builder()
                        .name(r.getName())
                        .brand(r.getBrand())
                        .limit(r.getCreditLimit())
                        .currentBalance(r.getCurrentBalance())
                        .utilizationPercentage(calculatePercentage(r.getCurrentBalance(), r.getCreditLimit()))
                        .dueDay(r.getInvoiceDueDay() != null ? r.getInvoiceDueDay() : 0)
                        .build())
                .collect(Collectors.toList());

        // 5. Investments
        List<InvestmentResponse> investmentResponses = investmentService.getInvestments(email);
        BigDecimal totalInvested = investmentResponses.stream()
                .map(i -> i.getCurrentValue() != null ? i.getCurrentValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<MonthlyReportResponse.InvestmentData> investments = investmentResponses.stream()
                .collect(Collectors.groupingBy(InvestmentResponse::getType, Collectors.reducing(BigDecimal.ZERO, 
                        i -> i.getCurrentValue() != null ? i.getCurrentValue() : BigDecimal.ZERO, BigDecimal::add)))
                .entrySet().stream()
                .map(e -> MonthlyReportResponse.InvestmentData.builder()
                        .type(e.getKey().name())
                        .totalValue(e.getValue())
                        .percentageOfPortfolio(calculatePercentage(e.getValue(), totalInvested))
                        .build())
                .sorted((a, b) -> b.getTotalValue().compareTo(a.getTotalValue()))
                .collect(Collectors.toList());

        // 6. Installments
        List<InstallmentPurchaseResponse> installmentPurchases = installmentService.getInstallmentPurchases(email);
        List<MonthlyReportResponse.InstallmentData> activeInstallments = installmentPurchases.stream()
                .flatMap(p -> p.getInstallments().stream()
                        .filter(i -> i.getDueDate().getMonthValue() == month && i.getDueDate().getYear() == year)
                        .map(i -> MonthlyReportResponse.InstallmentData.builder()
                                .description(p.getDescription())
                                .totalAmount(p.getTotalAmount())
                                .currentInstallment(i.getInstallmentNumber())
                                .totalInstallments(p.getInstallmentsCount())
                                .installmentAmount(i.getAmount())
                                .nextDueDate(i.getDueDate())
                                .build()))
                .collect(Collectors.toList());

        // 7. Future Commitments & Recurring
        List<MonthlyReportResponse.FutureCommitment> futureCommitments = activeInstallments.stream()
                .map(i -> MonthlyReportResponse.FutureCommitment.builder()
                        .description(i.getDescription() + " (" + i.getCurrentInstallment() + "/" + i.getTotalInstallments() + ")")
                        .amount(i.getInstallmentAmount())
                        .date(i.getNextDueDate())
                        .type("INSTALLMENT")
                        .isRecurring(false)
                        .build())
                .collect(Collectors.toList());

        // Simplified recurring detection: Expenses that repeat in similar amounts/descriptions could be detected.
        // For now, we'll fetch transactions marked as isRecurring.
        List<MonthlyReportResponse.RecurringCommitment> recurringCommitments = new ArrayList<>();
        // This would ideally come from a dedicated RecurringTransaction entity or logic.
        // As a placeholder, we use transactions from the current month that are marked as recurring.
        // In a real scenario, this would be a separate service.

        // 8. Budget Status for AI
        List<BudgetStatusResponse> budgets = budgetService.getBudgetStatus(email, month, year);
        Map<String, BigDecimal> budgetStatusMap = budgets.stream()
                .collect(Collectors.toMap(BudgetStatusResponse::getCategoryName, BudgetStatusResponse::getPercentUsed));

        // 9. Historical Outlook (Last 6 months)
        List<MonthlyReportResponse.HistoricalOutlookPoint> historicalOutlook = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate date = start.minusMonths(i);
            TransactionSummaryResponse summary = transactionService.getMonthlySummary(email, date.getMonthValue(), date.getYear());
            historicalOutlook.add(MonthlyReportResponse.HistoricalOutlookPoint.builder()
                    .label(getMonthName(date.getMonthValue()).substring(0, 3) + "/" + String.valueOf(date.getYear()).substring(2))
                    .income(summary.getTotalIncome())
                    .expense(summary.getTotalExpense())
                    .savingsRate(summary.getSavingsRate())
                    .build());
        }

        // 10. AI Analysis
        UserFinancialSummary aiData = UserFinancialSummary.builder()
                .userName(user.getName())
                .monthlyIncome(currentSummary.getTotalIncome())
                .monthlyExpense(currentSummary.getTotalExpense())
                .savingsRate(currentSummary.getSavingsRate())
                .previousMonthExpense(prevSummary.getTotalExpense())
                .expensesByCategory(categories.stream().collect(Collectors.toMap(MonthlyReportResponse.CategoryBreakdown::getName, MonthlyReportResponse.CategoryBreakdown::getAmount)))
                .budgetStatus(budgetStatusMap)
                .creditCards(creditCards.stream().map(c -> UserFinancialSummary.CreditCardSummary.builder()
                        .name(c.getName())
                        .limit(c.getLimit())
                        .balance(c.getCurrentBalance())
                        .build()).collect(Collectors.toList()))
                .investments(investments.stream().map(i -> UserFinancialSummary.InvestmentSummary.builder()
                        .type(i.getType())
                        .value(i.getTotalValue())
                        .build()).collect(Collectors.toList()))
                .build();

        AiReportAnalysis aiAnalysis = aiProvider.generateMonthlyReport(aiData);

        MonthlyReportResponse.ComparisonData comparison = null;
        BigDecimal prevIncome = prevSummary.getTotalIncome();
        BigDecimal prevExpense = prevSummary.getTotalExpense();
        
        // Use a small epsilon or just check if it's strictly greater than zero for both
        if ((prevIncome != null && prevIncome.compareTo(BigDecimal.ZERO) != 0) || 
            (prevExpense != null && prevExpense.compareTo(BigDecimal.ZERO) != 0)) {
            
            comparison = MonthlyReportResponse.ComparisonData.builder()
                    .prevMonthIncome(prevIncome)
                    .prevMonthExpense(prevExpense)
                    .prevMonthSavingsRate(prevSummary.getSavingsRate())
                    .incomeVariation(calculateVariation(currentSummary.getTotalIncome(), prevIncome))
                    .expenseVariation(calculateVariation(currentSummary.getTotalExpense(), prevExpense))
                    .savingsRateVariation(currentSummary.getSavingsRate().subtract(prevSummary.getSavingsRate()))
                    .build();
        }

        return MonthlyReportResponse.builder()
                .month(month)
                .year(year)
                .userName(user.getName())
                .summary(MonthlyReportResponse.FinancialSummary.builder()
                        .totalIncome(currentSummary.getTotalIncome())
                        .totalExpense(currentSummary.getTotalExpense())
                        .netSavings(currentSummary.getNetBalance())
                        .savingsRate(currentSummary.getSavingsRate())
                        .build())
                .comparison(comparison)
                .health(MonthlyReportResponse.FinancialHealth.builder()
                        .savingsRateStatus(getSavingsRateStatus(currentSummary.getSavingsRate()))
                        .expenseToIncomeRatio(calculateRatio(currentSummary.getTotalExpense(), currentSummary.getTotalIncome()))
                        .creditUtilizationRate(calculateTotalCreditUtilization(creditCards))
                        .build())
                .categories(categories)
                .cashFlow(cashFlow)
                .institutions(institutions)
                .creditCards(creditCards)
                .investments(investments)
                .installments(activeInstallments)
                .futureCommitments(futureCommitments)
                .recurringCommitments(recurringCommitments)
                .historicalOutlook(historicalOutlook)
                .aiAnalysis(MonthlyReportResponse.AiAnalysis.builder()
                        .executiveSummary(aiAnalysis.getExecutiveSummary())
                        .topInsights(aiAnalysis.getTopInsights() != null ? aiAnalysis.getTopInsights().stream()
                                .map(i -> MonthlyReportResponse.AiAnalysis.InsightItem.builder()
                                        .title(i.getTitle())
                                        .description(i.getDescription())
                                        .build())
                                .collect(Collectors.toList()) : new ArrayList<>())
                        .strengths(aiAnalysis.getStrengths())
                        .attentionPoints(aiAnalysis.getAttentionPoints())
                        .recommendations(aiAnalysis.getRecommendations())
                        .build())
                .build();
    }

    private BigDecimal calculatePercentage(BigDecimal part, BigDecimal total) {
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return part.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateVariation(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return current.subtract(previous).multiply(BigDecimal.valueOf(100)).divide(previous, 2, RoundingMode.HALF_UP);
    }

    private String getMonthName(int month) {
        return switch (month) {
            case 1 -> "Janeiro";
            case 2 -> "Fevereiro";
            case 3 -> "Março";
            case 4 -> "Abril";
            case 5 -> "Maio";
            case 6 -> "Junho";
            case 7 -> "Julho";
            case 8 -> "Agosto";
            case 9 -> "Setembro";
            case 10 -> "Outubro";
            case 11 -> "Novembro";
            case 12 -> "Dezembro";
            default -> "";
        };
    }

    private BigDecimal calculateRatio(BigDecimal part, BigDecimal total) {
        if (total == null || total.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return part.divide(total, 4, RoundingMode.HALF_UP);
    }

    private String getSavingsRateStatus(BigDecimal rate) {
        if (rate.compareTo(BigDecimal.valueOf(20)) >= 0) return "EXCELLENT";
        if (rate.compareTo(BigDecimal.valueOf(10)) >= 0) return "GOOD";
        return "POOR";
    }

    private BigDecimal calculateTotalCreditUtilization(List<MonthlyReportResponse.CreditCardData> cards) {
        BigDecimal totalLimit = cards.stream().map(MonthlyReportResponse.CreditCardData::getLimit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalBalance = cards.stream().map(MonthlyReportResponse.CreditCardData::getCurrentBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
        return calculatePercentage(totalBalance, totalLimit);
    }
}
