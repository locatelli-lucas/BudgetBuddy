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
}
