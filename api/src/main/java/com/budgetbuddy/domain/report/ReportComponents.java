package com.budgetbuddy.domain.report;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

public class ReportComponents {

    private static final DecimalFormat CURRENCY_FORMAT;
    private static final DecimalFormat PERCENT_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(new Locale("pt", "BR"));
        symbols.setCurrencySymbol("R$");
        symbols.setGroupingSeparator('.');
        symbols.setDecimalSeparator(',');
        CURRENCY_FORMAT = new DecimalFormat("R$ #,##0.00", symbols);
        PERCENT_FORMAT = new DecimalFormat("#,##0.0", symbols);
    }

    public static String formatCurrency(BigDecimal value) {
        if (value == null) return "R$ 0,00";
        return CURRENCY_FORMAT.format(value);
    }

    public static String formatPercent(BigDecimal value) {
        if (value == null) return "0,0%";
        return PERCENT_FORMAT.format(value) + "%";
    }

    public static void appendMetric(StringBuilder html, String label, BigDecimal value, BigDecimal variation, boolean isGoodIfPositive) {
        String varClass = "";
        String varIcon = "";
        if (variation != null && variation.compareTo(BigDecimal.ZERO) != 0) {
            boolean isPositive = variation.compareTo(BigDecimal.ZERO) > 0;
            boolean isGood = isPositive == isGoodIfPositive;
            varClass = isGood ? "text-success" : "text-danger";
            varIcon = isPositive ? "↑" : "↓";
        }

        html.append("<div style='flex: 1;'>")
            .append("<div class='metric-label'>").append(label).append("</div>")
            .append("<div class='metric-value'>").append(formatCurrency(value)).append("</div>");
        
        if (variation != null && variation.compareTo(BigDecimal.ZERO) != 0) {
            html.append("<div class='variation ").append(varClass).append("'>")
                .append(varIcon).append(" ").append(formatPercent(variation.abs()))
                .append(" <span class='text-muted' style='font-weight: normal; font-size: 8pt;'>vs mês ant.</span></div>");
        }
        
        html.append("</div>");
    }

    public static void appendProgressBar(StringBuilder html, String label, BigDecimal value, String color, String rightText) {
        html.append("<div style='margin-bottom: 12pt;'>")
            .append("<div style='display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 3pt;'>")
            .append("<span>").append(label).append("</span>")
            .append("<span class='text-muted'>").append(rightText).append("</span>")
            .append("</div>")
            .append("<div style='background: ").append(PdfTheme.COLOR_BG_LIGHT).append("; height: 6pt; border-radius: 3pt; overflow: hidden;'>")
            .append("<div style='background: ").append(color).append("; width: ").append(value).append("%; height: 100%; border-radius: 3pt;'></div>")
            .append("</div>")
            .append("</div>");
    }

    public static void startPage(StringBuilder html, String title, String subtitle) {
        html.append("<div class='page'>");
        if (title != null) {
            html.append("<div style='display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20pt;'>")
                .append("<div>")
                .append("<div class='text-accent' style='font-weight: 700; font-size: 10pt; letter-spacing: 0.1em; text-transform: uppercase;'>BudgetBuddy</div>")
                .append("<h1 style='margin: 5pt 0;'>").append(title).append("</h1>")
                .append("</div>");
            if (subtitle != null) {
                html.append("<div class='text-muted' style='font-size: 12pt;'>").append(subtitle).append("</div>");
            }
            html.append("</div>");
        }
    }

    public static void endPage(StringBuilder html, int pageNum) {
        html.append("<div class='footer'>BudgetBuddy Financial Statement &bull; Página ").append(pageNum).append("</div>");
        html.append("</div>");
    }

    public static void appendDailyCashFlowChart(StringBuilder html, java.util.List<com.budgetbuddy.domain.report.dto.MonthlyReportResponse.CashFlowPoint> cashFlow, Integer month, Integer year) {
        if (cashFlow == null || cashFlow.isEmpty()) return;

        int daysInChart;
        java.time.LocalDate startDate;

        if (month != null && month > 0 && year != null && year > 0) {
            daysInChart = java.time.YearMonth.of(year, month).lengthOfMonth();
            startDate = java.time.LocalDate.of(year, month, 1);
        } else {
            // Custom period: determine length from data
            java.time.LocalDate minDate = cashFlow.stream().map(p -> p.getDate()).min(java.time.LocalDate::compareTo).orElse(java.time.LocalDate.now());
            java.time.LocalDate maxDate = cashFlow.stream().map(p -> p.getDate()).max(java.time.LocalDate::compareTo).orElse(java.time.LocalDate.now());
            daysInChart = (int) java.time.temporal.ChronoUnit.DAYS.between(minDate, maxDate) + 1;
            startDate = minDate;
            
            // Limit chart size if period is too long for daily bars in PDF
            if (daysInChart > 62) {
                // For very long periods, we might want to aggregate, but for now just show data points
                daysInChart = Math.min(daysInChart, 100); 
            }
        }

        BigDecimal[] dailyAmounts = new BigDecimal[daysInChart];
        for (int i = 0; i < daysInChart; i++) dailyAmounts[i] = BigDecimal.ZERO;

        for (com.budgetbuddy.domain.report.dto.MonthlyReportResponse.CashFlowPoint point : cashFlow) {
            int dayIndex = (int) java.time.temporal.ChronoUnit.DAYS.between(startDate, point.getDate());
            if (dayIndex >= 0 && dayIndex < daysInChart) {
                dailyAmounts[dayIndex] = dailyAmounts[dayIndex].add(point.getAmount());
            }
        }

        BigDecimal maxAbsAmount = BigDecimal.ONE;
        for (BigDecimal amt : dailyAmounts) {
            maxAbsAmount = maxAbsAmount.max(amt.abs());
        }

        html.append("<div class='card no-break'>");
        html.append("<h3>").append(daysInChart > 35 ? "Fluxo de Caixa no Período" : "Fluxo de Caixa Diário").append("</h3>");
        html.append("<p class='text-muted' style='font-size: 8pt; margin-bottom: 15pt;'>Saldo líquido (Entradas - Saídas)</p>");

        html.append("<div style='display: flex; height: 120pt; align-items: stretch;'>");

        // Y-Axis
        html.append("<div style='width: 50pt; display: flex; flex-direction: column; justify-content: space-between; text-align: right; padding-right: 8pt; border-right: 1px solid ").append(PdfTheme.COLOR_BORDER).append(";'>");
        html.append("<div style='font-size: 7pt; color: ").append(PdfTheme.COLOR_SECONDARY).append(";'>").append(formatCurrency(maxAbsAmount)).append("</div>");
        html.append("<div style='font-size: 7pt; color: ").append(PdfTheme.COLOR_SECONDARY).append(";'>").append(formatCurrency(maxAbsAmount.divide(new BigDecimal(2), 2, java.math.RoundingMode.HALF_UP))).append("</div>");
        html.append("<div style='font-size: 7pt; color: ").append(PdfTheme.COLOR_ACCENT).append("; font-weight: bold;'>R$ 0,00</div>");
        html.append("</div>");

        // Chart Area
        html.append("<div style='flex: 1; display: flex; align-items: flex-end; gap: 2pt; padding-left: 5pt; position: relative;'>");
        
        // Zero line overlay
        html.append("<div style='position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: ").append(PdfTheme.COLOR_ACCENT).append("; opacity: 0.2;'></div>");

        for (int i = 0; i < daysInChart; i++) {
            BigDecimal amount = dailyAmounts[i];
            double heightPct = amount.compareTo(BigDecimal.ZERO) == 0 ? 2 : Math.max(5, amount.abs().divide(maxAbsAmount, 4, java.math.RoundingMode.HALF_UP).doubleValue() * 95);
            String color = amount.compareTo(BigDecimal.ZERO) >= 0 ? PdfTheme.COLOR_ACCENT : PdfTheme.COLOR_DANGER;
            if (amount.compareTo(BigDecimal.ZERO) == 0) color = PdfTheme.COLOR_BORDER;

            html.append("<div style='flex: 1; height: ").append(heightPct).append("%; background: ").append(color).append("; border-radius: 1pt;'></div>");
        }
        
        html.append("</div>");
        html.append("</div>");

        // X-Axis Labels
        html.append("<div style='display: flex; justify-content: space-between; margin-left: 58pt; margin-top: 5pt; font-size: 7pt; color: ").append(PdfTheme.COLOR_SECONDARY).append(";'>");
        if (month != null && month > 0) {
            html.append("<span>Dia 01</span><span>Dia 15</span><span>Dia ").append(daysInChart).append("</span>");
        } else {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("dd/MM");
            html.append("<span>").append(startDate.format(fmt)).append("</span>")
                .append("<span>Período Customizado</span>")
                .append("<span>").append(startDate.plusDays(daysInChart - 1).format(fmt)).append("</span>");
        }
        html.append("</div>");

        html.append("</div>");
    }
}
