package com.budgetbuddy.domain.report;

import com.budgetbuddy.domain.report.dto.MonthlyReportResponse;
import com.itextpdf.html2pdf.HtmlConverter;
import com.budgetbuddy.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfReportGenerator {

    private final ReportService reportService;
    private static final String CURRENCY_FORMAT = "R$ %,.2f";

    public byte[] generateMonthlyPdfReport(String email, int month, int year) {
        MonthlyReportResponse reportData = reportService.getMonthlyReport(email, month, year);
        String htmlContent = buildHtmlForPdf(reportData);
        
        try (ByteArrayOutputStream target = new ByteArrayOutputStream()) {
            HtmlConverter.convertToPdf(htmlContent, target);
            return target.toByteArray();
        } catch (IOException e) {
            log.error("Error generating PDF report", e);
            throw new BusinessException("Failed to generate PDF report");
        }
    }

    private String buildHtmlForPdf(MonthlyReportResponse data) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: 'Helvetica', sans-serif; color: #1e293b; margin: 0; padding: 0; line-height: 1.5; }");
        html.append(".page { padding: 40px; page-break-after: always; }");
        html.append(".no-break { page-break-inside: avoid; }");
        
        // Colors
        html.append(".text-primary { color: #2563eb; }");
        html.append(".text-success { color: #16a34a; }");
        html.append(".text-danger { color: #dc2626; }");
        html.append(".text-muted { color: #64748b; }");
        html.append(".bg-light { background-color: #f8fafc; }");
        
        // Components
        html.append(".card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }");
        html.append(".header { text-align: center; margin-bottom: 50px; padding-top: 100px; }");
        html.append(".logo { font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }");
        html.append(".section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }");
        
        // Grid (simulated with table for better PDF rendering)
        html.append(".grid-3 { width: 100%; border-collapse: collapse; }");
        html.append(".grid-3 td { width: 33.33%; padding: 10px; vertical-align: top; }");
        
        // Stats
        html.append(".stat-label { font-size: 12px; text-transform: uppercase; color: #64748b; margin-bottom: 5px; }");
        html.append(".stat-value { font-size: 24px; font-weight: bold; }");
        
        // Progress Bars
        html.append(".progress-container { background: #f1f5f9; border-radius: 8px; height: 12px; width: 100%; margin: 8px 0; overflow: hidden; }");
        html.append(".progress-bar { height: 100%; border-radius: 8px; }");
        
        // Lists
        html.append(".ai-list { list-style: none; padding: 0; }");
        html.append(".ai-list li { margin-bottom: 10px; padding-left: 20px; position: relative; }");
        html.append(".ai-list li:before { content: '•'; position: absolute; left: 0; color: #2563eb; font-weight: bold; }");
        
        // Table
        html.append("table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }");
        html.append("table.data-table th { text-align: left; background: #f8fafc; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; }");
        html.append("table.data-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }");
        
        html.append("</style></head><body>");

        // --- PAGE 1: COVER ---
        html.append("<div class='page'>");
        html.append("<div class='header'>");
        html.append("<div class='logo'>BudgetBuddy</div>");
        html.append("<h1 style='font-size: 36px; margin: 20px 0;'>Relatório Financeiro Mensal</h1>");
        html.append("<p style='font-size: 20px;' class='text-muted'>").append(getMonthName(data.getMonth())).append(" ").append(data.getYear()).append("</p>");
        html.append("<div style='margin-top: 100px;'>");
        html.append("<p class='text-muted'>Preparado para</p>");
        html.append("<h2 style='font-size: 24px;'>").append(data.getUserName()).append("</h2>");
        html.append("</div>");
        html.append("<div style='margin-top: 200px; font-size: 12px;' class='text-muted'>");
        html.append("Gerado em ").append(LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        html.append("</div></div></div>");

        // --- PAGE 2: EXECUTIVE SUMMARY & AI ---
        html.append("<div class='page'>");
        html.append("<div class='section-title'>Resumo Executivo</div>");
        
        html.append("<table class='grid-3'><tr>");
        appendStatCard(html, "Receita Total", data.getSummary().getTotalIncome(), "text-success");
        appendStatCard(html, "Despesa Total", data.getSummary().getTotalExpense(), "text-danger");
        appendStatCard(html, "Saldo Líquido", data.getSummary().getNetSavings(), "");
        html.append("</tr></table>");

        html.append("<div class='card bg-light' style='margin-top: 20px;'>");
        html.append("<div style='font-weight: bold; color: #2563eb; margin-bottom: 10px;'>Insight do Consultor AI</div>");
        html.append("<p style='font-style: italic; font-size: 14px;'>").append(data.getAiAnalysis().getExecutiveSummary()).append("</p>");
        html.append("</div>");

        html.append("<div style='margin-top: 30px;' class='no-break'>");
        html.append("<table class='grid-3'><tr>");
        html.append("<td colspan='2'>");
        html.append("<div class='section-title'>Forças Financeiras</div>");
        html.append("<ul class='ai-list'>");
        for (String s : data.getAiAnalysis().getStrengths()) html.append("<li>").append(s).append("</li>");
        html.append("</ul></td>");
        html.append("<td>");
        html.append("<div class='section-title'>Pontos de Atenção</div>");
        html.append("<ul class='ai-list'>");
        for (String a : data.getAiAnalysis().getAttentionPoints()) html.append("<li>").append(a).append("</li>");
        html.append("</ul></td></tr></table></div>");

        html.append("<div style='margin-top: 30px;' class='no-break'>");
        html.append("<div class='section-title'>Recomendações Práticas</div>");
        html.append("<div class='card'>");
        html.append("<ul class='ai-list'>");
        for (String r : data.getAiAnalysis().getRecommendations()) html.append("<li>").append(r).append("</li>");
        html.append("</ul></div></div>");
        html.append("</div>");

        // --- PAGE 3: DETAILED ANALYSIS ---
        html.append("<div class='page'>");
        
        // Categories
        html.append("<div class='section-title'>Distribuição de Gastos</div>");
        html.append("<div class='card'>");
        for (MonthlyReportResponse.CategoryBreakdown cat : data.getCategories().stream().limit(8).toList()) {
            html.append("<div style='margin-bottom: 12px;'>");
            html.append("<div style='display: flex; justify-content: space-between; font-size: 12px;'>");
            html.append("<span>").append(cat.getName()).append("</span>");
            html.append("<span style='float: right;'>").append(String.format(CURRENCY_FORMAT, cat.getAmount())).append(" (").append(cat.getPercentage()).append("%)</span>");
            html.append("</div>");
            html.append("<div class='progress-container'>");
            html.append("<div class='progress-bar' style='width: ").append(cat.getPercentage()).append("%; background-color: ").append(cat.getColor() != null ? cat.getColor() : "#2563eb").append(";'></div>");
            html.append("</div></div>");
        }
        html.append("</div>");

        // Comparisons
        html.append("<div style='margin-top: 30px;' class='no-break'>");
        html.append("<div class='section-title'>Comparativo Mensal</div>");
        html.append("<table class='grid-3'><tr>");
        appendVariationCard(html, "Variação de Renda", data.getComparison().getIncomeVariation());
        appendVariationCard(html, "Variação de Despesa", data.getComparison().getExpenseVariation());
        html.append("<td><div class='card'><div class='stat-label'>Taxa de Economia</div><div class='stat-value'>")
            .append(data.getSummary().getSavingsRate()).append("%</div></div></td>");
        html.append("</tr></table></div>");

        // Credit Cards
        if (!data.getCreditCards().isEmpty()) {
            html.append("<div style='margin-top: 30px;' class='no-break'>");
            html.append("<div class='section-title'>Uso de Cartão de Crédito</div>");
            html.append("<table class='data-table'>");
            html.append("<tr><th>Cartão</th><th>Limite</th><th>Fatura Atual</th><th>Uso (%)</th></tr>");
            for (MonthlyReportResponse.CreditCardData card : data.getCreditCards()) {
                html.append("<tr>");
                html.append("<td>").append(card.getName()).append("</td>");
                html.append("<td>").append(String.format(CURRENCY_FORMAT, card.getLimit())).append("</td>");
                html.append("<td>").append(String.format(CURRENCY_FORMAT, card.getCurrentBalance())).append("</td>");
                html.append("<td>").append(card.getUtilizationPercentage()).append("%</td>");
                html.append("</tr>");
            }
            html.append("</table></div>");
        }
        html.append("</div>");

        // --- PAGE 4: INVESTMENTS & FUTURE (Optional) ---
        if (!data.getInvestments().isEmpty() || !data.getFutureCommitments().isEmpty()) {
            html.append("<div class='page'>");
            
            if (!data.getInvestments().isEmpty()) {
                html.append("<div class='section-title'>Patrimônio e Investimentos</div>");
                html.append("<div class='card'>");
                html.append("<table class='data-table'>");
                html.append("<tr><th>Tipo de Ativo</th><th>Valor Total</th><th>Alocação (%)</th></tr>");
                for (MonthlyReportResponse.InvestmentData inv : data.getInvestments()) {
                    html.append("<tr>");
                    html.append("<td>").append(inv.getType()).append("</td>");
                    html.append("<td>").append(String.format(CURRENCY_FORMAT, inv.getTotalValue())).append("</td>");
                    html.append("<td>").append(inv.getPercentageOfPortfolio()).append("%</td>");
                    html.append("</tr>");
                }
                html.append("</table></div>");
            }

            if (!data.getFutureCommitments().isEmpty()) {
                html.append("<div style='margin-top: 30px;'>");
                html.append("<div class='section-title'>Compromissos Futuros Próximos</div>");
                html.append("<table class='data-table'>");
                html.append("<tr><th>Descrição</th><th>Data</th><th>Valor</th></tr>");
                for (MonthlyReportResponse.FutureCommitment comm : data.getFutureCommitments()) {
                    html.append("<tr>");
                    html.append("<td>").append(comm.getDescription()).append("</td>");
                    html.append("<td>").append(comm.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</td>");
                    html.append("<td class='text-danger'>").append(String.format(CURRENCY_FORMAT, comm.getAmount())).append("</td>");
                    html.append("</tr>");
                }
                html.append("</table></div>");
            }
            
            html.append("<div style='margin-top: 100px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;'>");
            html.append("<p class='text-muted' style='font-size: 10px;'>Este relatório foi gerado automaticamente pelo BudgetBuddy AI e deve ser usado apenas para fins informativos.</p>");
            html.append("</div>");
            html.append("</div>");
        }

        html.append("</body></html>");
        return html.toString();
    }

    private void appendStatCard(StringBuilder html, String label, BigDecimal value, String colorClass) {
        html.append("<td><div class='card'>");
        html.append("<div class='stat-label'>").append(label).append("</div>");
        html.append("<div class='stat-value ").append(colorClass).append("'>").append(String.format(CURRENCY_FORMAT, value)).append("</div>");
        html.append("</div></td>");
    }

    private void appendVariationCard(StringBuilder html, String label, BigDecimal variation) {
        String color = variation.compareTo(BigDecimal.ZERO) > 0 ? "text-danger" : "text-success";
        // For income, positive variation is good
        if (label.contains("Renda")) {
            color = variation.compareTo(BigDecimal.ZERO) >= 0 ? "text-success" : "text-danger";
        }
        
        String sign = variation.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "";
        
        html.append("<td><div class='card'>");
        html.append("<div class='stat-label'>").append(label).append("</div>");
        html.append("<div class='stat-value ").append(color).append("'>").append(sign).append(variation).append("%</div>");
        html.append("</div></td>");
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
}
