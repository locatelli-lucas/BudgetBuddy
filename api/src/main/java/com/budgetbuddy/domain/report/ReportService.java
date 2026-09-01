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
import com.budgetbuddy.domain.transaction.Transaction;
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
import java.time.temporal.ChronoUnit;
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
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return getReportForPeriod(email, start, end, month, year);
    }

    public MonthlyReportResponse getReportForPeriod(String email, LocalDate start, LocalDate end, Integer month, Integer year) {
        User user = userService.getUserByEmail(email);
        
        // 1. Summaries
        BigDecimal totalIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.INCOME, start, end);
        BigDecimal totalExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.EXPENSE, start, end);
        BigDecimal netSavings = totalIncome.subtract(totalExpense);
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }

        long days = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevStart = start.minusDays(days);
        LocalDate prevEnd = start.minusDays(1);
        
        BigDecimal prevIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.INCOME, prevStart, prevEnd);
        BigDecimal prevExpense = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(
                user.getId(), Transaction.TransactionType.EXPENSE, prevStart, prevEnd);
        BigDecimal prevNet = prevIncome.subtract(prevExpense);
        BigDecimal prevSavingsRate = BigDecimal.ZERO;
        if (prevIncome.compareTo(BigDecimal.ZERO) > 0) {
            prevSavingsRate = prevNet.divide(prevIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }

        // 2. Category Aggregation
        List<Object[]> categoryData = transactionRepository.aggregateExpensesByCategory(user.getId(), start, end);
        List<MonthlyReportResponse.CategoryBreakdown> categories = categoryData.stream()
                .map(row -> MonthlyReportResponse.CategoryBreakdown.builder()
                        .name((String) row[0])
                        .amount((BigDecimal) row[1])
                        .percentage(calculatePercentage((BigDecimal) row[1], totalExpense))
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

        // 4. Financial Resources
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

        // 6. Installments (Active in this period)
        List<InstallmentPurchaseResponse> installmentPurchases = installmentService.getInstallmentPurchases(email);
        List<MonthlyReportResponse.InstallmentData> activeInstallments = installmentPurchases.stream()
                .flatMap(p -> p.getInstallments().stream()
                        .filter(i -> !i.getDueDate().isBefore(start) && !i.getDueDate().isAfter(end))
                        .map(i -> MonthlyReportResponse.InstallmentData.builder()
                                .description(p.getDescription())
                                .totalAmount(p.getTotalAmount())
                                .currentInstallment(i.getInstallmentNumber())
                                .totalInstallments(p.getInstallmentsCount())
                                .installmentAmount(i.getAmount())
                                .nextDueDate(i.getDueDate())
                                .build()))
                .collect(Collectors.toList());

        // 7. Future Commitments
        List<MonthlyReportResponse.FutureCommitment> futureCommitments = activeInstallments.stream()
                .map(i -> MonthlyReportResponse.FutureCommitment.builder()
                        .description(i.getDescription() + " (" + i.getCurrentInstallment() + "/" + i.getTotalInstallments() + ")")
                        .amount(i.getInstallmentAmount())
                        .date(i.getNextDueDate())
                        .type("INSTALLMENT")
                        .isRecurring(false)
                        .build())
                .collect(Collectors.toList());

        List<MonthlyReportResponse.RecurringCommitment> recurringCommitments = new ArrayList<>();

        // 8. Budget Status (Use first month of period if multi-month)
        List<BudgetStatusResponse> budgets = budgetService.getBudgetStatus(email, start.getMonthValue(), start.getYear());
        Map<String, BigDecimal> budgetStatusMap = budgets.stream()
                .collect(Collectors.toMap(BudgetStatusResponse::getCategoryName, BudgetStatusResponse::getPercentUsed));

        // 9. Historical Outlook
        List<MonthlyReportResponse.HistoricalOutlookPoint> historicalOutlook = new ArrayList<>();
        int monthsToLookBack = days > 31 ? 12 : 6;
        for (int i = monthsToLookBack - 1; i >= 0; i--) {
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
                .startDate(start.toString())
                .endDate(end.toString())
                .monthlyIncome(totalIncome)
                .monthlyExpense(totalExpense)
                .savingsRate(savingsRate)
                .previousMonthExpense(prevExpense)
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
        if (prevIncome.compareTo(BigDecimal.ZERO) != 0 || prevExpense.compareTo(BigDecimal.ZERO) != 0) {
            comparison = MonthlyReportResponse.ComparisonData.builder()
                    .prevMonthIncome(prevIncome)
                    .prevMonthExpense(prevExpense)
                    .prevMonthSavingsRate(prevSavingsRate)
                    .incomeVariation(calculateVariation(totalIncome, prevIncome))
                    .expenseVariation(calculateVariation(totalExpense, prevExpense))
                    .savingsRateVariation(savingsRate.subtract(prevSavingsRate))
                    .build();
        }

        return MonthlyReportResponse.builder()
                .month(month)
                .year(year)
                .startDate(start)
                .endDate(end)
                .userName(user.getName())
                .summary(MonthlyReportResponse.FinancialSummary.builder()
                        .totalIncome(totalIncome)
                        .totalExpense(totalExpense)
                        .netSavings(netSavings)
                        .savingsRate(savingsRate)
                        .build())
                .comparison(comparison)
                .health(MonthlyReportResponse.FinancialHealth.builder()
                        .savingsRateStatus(getSavingsRateStatus(savingsRate))
                        .expenseToIncomeRatio(calculateRatio(totalExpense, totalIncome))
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
