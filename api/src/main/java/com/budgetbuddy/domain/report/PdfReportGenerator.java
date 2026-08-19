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
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfReportGenerator {

    private final ReportService reportService;

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
        html.append("<style>").append(PdfTheme.getGlobalStyles()).append("</style>");
        html.append("</head><body>");

        int pageNum = 1;

        // --- PAGE 1: EXECUTIVE SUMMARY ---
        ReportComponents.startPage(html, "Sumário Executivo", getMonthName(data.getMonth()) + " " + data.getYear());
        
        // Main Metrics
        html.append("<div style='display: flex; gap: 20pt; margin-bottom: 30pt; border-bottom: 1px solid ").append(PdfTheme.COLOR_BORDER).append("; padding-bottom: 20pt;'>");
        ReportComponents.appendMetric(html, "Receita Total", data.getSummary().getTotalIncome(), data.getComparison().getIncomeVariation(), true);
        ReportComponents.appendMetric(html, "Despesa Total", data.getSummary().getTotalExpense(), data.getComparison().getExpenseVariation(), false);
        ReportComponents.appendMetric(html, "Resultado Líquido", data.getSummary().getNetSavings(), null, true);
        ReportComponents.appendMetric(html, "Taxa de Economia", data.getSummary().getSavingsRate(), data.getComparison().getSavingsRateVariation(), true);
        html.append("</div>");

        // AI Insights
        if (data.getAiAnalysis() != null) {
            html.append("<div class='card bg-light'>");
            html.append("<h3 class='text-accent' style='margin-top: 0;'>Análise do Consultor AI</h3>");
            html.append("<p style='font-size: 11pt; margin-bottom: 20pt;'>").append(data.getAiAnalysis().getExecutiveSummary()).append("</p>");
            
            if (data.getAiAnalysis().getTopInsights() != null && !data.getAiAnalysis().getTopInsights().isEmpty()) {
                html.append("<div style='display: flex; gap: 15pt;'>");
                for (MonthlyReportResponse.AiAnalysis.InsightItem insight : data.getAiAnalysis().getTopInsights()) {
                    html.append("<div style='flex: 1; border-left: 2pt solid ").append(PdfTheme.COLOR_ACCENT).append("; padding-left: 10pt;'>")
                        .append("<div style='font-weight: 700; font-size: 9pt; margin-bottom: 2pt;'>").append(insight.getTitle()).append("</div>")
                        .append("<div style='font-size: 8.5pt; color: ").append(PdfTheme.COLOR_SECONDARY).append(";'>").append(insight.getDescription()).append("</div>")
                        .append("</div>");
                }
                html.append("</div>");
            }
            html.append("</div>");
        }

        // Strengths & Attention Points
        html.append("<div style='display: flex; gap: 20pt; margin-top: 20pt;'>");
        html.append("<div style='flex: 1;'><h3>Pontos Fortes</h3><ul>");
        for (String s : data.getAiAnalysis().getStrengths()) html.append("<li style='margin-bottom: 5pt;'>").append(s).append("</li>");
        html.append("</ul></div>");
        html.append("<div style='flex: 1;'><h3>Pontos de Atenção</h3><ul>");
        for (String a : data.getAiAnalysis().getAttentionPoints()) html.append("<li style='margin-bottom: 5pt;'>").append(a).append("</li>");
        html.append("</ul></div>");
        html.append("</div>");

        ReportComponents.endPage(html, pageNum++);

        // --- PAGE 2: CASH FLOW & CATEGORIES ---
        ReportComponents.startPage(html, "Fluxo de Caixa & Despesas", null);
        
        html.append("<h2>Distribuição por Categoria</h2>");
        html.append("<div style='display: flex; gap: 40pt;'>");
        
        // Left column: Progress bars
        html.append("<div style='flex: 1.5;'>");
        for (MonthlyReportResponse.CategoryBreakdown cat : data.getCategories().stream().limit(10).toList()) {
            ReportComponents.appendProgressBar(html, cat.getName(), cat.getPercentage(), 
                cat.getColor() != null ? cat.getColor() : PdfTheme.COLOR_ACCENT, 
                ReportComponents.formatCurrency(cat.getAmount()) + " (" + cat.getPercentage() + "%)");
        }
        html.append("</div>");
        
        // Right column: Table
        html.append("<div style='flex: 1;'>");
        html.append("<table><thead><tr><th>Categoria</th><th style='text-align: right;'>Valor</th></tr></thead><tbody>");
        for (MonthlyReportResponse.CategoryBreakdown cat : data.getCategories().stream().limit(10).toList()) {
            html.append("<tr><td>").append(cat.getName()).append("</td><td style='text-align: right;'>")
                .append(ReportComponents.formatCurrency(cat.getAmount())).append("</td></tr>");
        }
        html.append("</tbody></table>");
        html.append("</div></div>");

        ReportComponents.endPage(html, pageNum++);

        // --- PAGE 3: INSTITUTIONS & ACCOUNTS ---
        if (data.getInstitutions() != null && !data.getInstitutions().isEmpty()) {
            ReportComponents.startPage(html, "Instituições & Saldos", null);
            
            for (MonthlyReportResponse.InstitutionGroup inst : data.getInstitutions()) {
                html.append("<div class='card no-break'>");
                html.append("<div style='display: flex; justify-content: space-between; align-items: center; margin-bottom: 10pt;'>");
                html.append("<h3 style='margin: 0;'>").append(inst.getName()).append("</h3>");
                html.append("<div class='metric-value'>").append(ReportComponents.formatCurrency(inst.getTotalBalance())).append("</div>");
                html.append("</div>");
                
                html.append("<table><tbody>");
                for (MonthlyReportResponse.InstitutionGroup.ResourceSummary res : inst.getResources()) {
                    html.append("<tr>")
                        .append("<td style='border: none;'>").append(res.getName()).append(" <span class='text-muted' style='font-size: 8pt;'>(").append(res.getType()).append(")</span></td>")
                        .append("<td style='text-align: right; border: none;'>").append(ReportComponents.formatCurrency(res.getBalance())).append("</td>")
                        .append("</tr>");
                }
                html.append("</tbody></table>");
                html.append("</div>");
            }
            
            ReportComponents.endPage(html, pageNum++);
        }

        // --- PAGE 4: CREDIT CARDS & INSTALLMENTS ---
        if (!data.getCreditCards().isEmpty() || !data.getInstallments().isEmpty()) {
            ReportComponents.startPage(html, "Cartões & Parcelamentos", null);
            
            if (!data.getCreditCards().isEmpty()) {
                html.append("<h2>Cartões de Crédito</h2>");
                html.append("<table><thead><tr><th>Cartão</th><th>Limite</th><th>Saldo</th><th style='text-align: right;'>Uso</th></tr></thead><tbody>");
                for (MonthlyReportResponse.CreditCardData card : data.getCreditCards()) {
                    html.append("<tr>")
                        .append("<td>").append(card.getName()).append("</td>")
                        .append("<td>").append(ReportComponents.formatCurrency(card.getLimit())).append("</td>")
                        .append("<td>").append(ReportComponents.formatCurrency(card.getCurrentBalance())).append("</td>")
                        .append("<td style='text-align: right;'>").append(card.getUtilizationPercentage()).append("%</td>")
                        .append("</tr>");
                }
                html.append("</tbody></table>");
            }

            if (!data.getInstallments().isEmpty()) {
                html.append("<h2 style='margin-top: 30pt;'>Parcelamentos Ativos</h2>");
                html.append("<table><thead><tr><th>Descrição</th><th>Parcela</th><th>Valor</th><th style='text-align: right;'>Total</th></tr></thead><tbody>");
                for (MonthlyReportResponse.InstallmentData inst : data.getInstallments()) {
                    html.append("<tr>")
                        .append("<td>").append(inst.getDescription()).append("</td>")
                        .append("<td>").append(inst.getCurrentInstallment()).append("/").append(inst.getTotalInstallments()).append("</td>")
                        .append("<td>").append(ReportComponents.formatCurrency(inst.getInstallmentAmount())).append("</td>")
                        .append("<td style='text-align: right;'>").append(ReportComponents.formatCurrency(inst.getTotalAmount())).append("</td>")
                        .append("</tr>");
                }
                html.append("</tbody></table>");
            }
            
            ReportComponents.endPage(html, pageNum++);
        }

        // --- PAGE 5: INVESTMENTS & FUTURE ---
        if (!data.getInvestments().isEmpty() || !data.getFutureCommitments().isEmpty()) {
            ReportComponents.startPage(html, "Investimentos & Compromissos", null);
            
            if (!data.getInvestments().isEmpty()) {
                html.append("<h2>Patrimônio e Investimentos</h2>");
                html.append("<table><thead><tr><th>Tipo de Ativo</th><th style='text-align: right;'>Valor Total</th><th style='text-align: right;'>Alocação</th></tr></thead><tbody>");
                for (MonthlyReportResponse.InvestmentData inv : data.getInvestments()) {
                    html.append("<tr>")
                        .append("<td>").append(inv.getType()).append("</td>")
                        .append("<td style='text-align: right;'>").append(ReportComponents.formatCurrency(inv.getTotalValue())).append("</td>")
                        .append("<td style='text-align: right;'>").append(inv.getPercentageOfPortfolio()).append("%</td>")
                        .append("</tr>");
                }
                html.append("</tbody></table>");
            }

            if (!data.getFutureCommitments().isEmpty()) {
                html.append("<h2 style='margin-top: 30pt;'>Compromissos Futuros</h2>");
                html.append("<table><thead><tr><th>Descrição</th><th>Data</th><th style='text-align: right;'>Valor</th></tr></thead><tbody>");
                for (MonthlyReportResponse.FutureCommitment comm : data.getFutureCommitments()) {
                    html.append("<tr>")
                        .append("<td>").append(comm.getDescription()).append("</td>")
                        .append("<td>").append(comm.getDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))).append("</td>")
                        .append("<td style='text-align: right; color: ").append(PdfTheme.COLOR_DANGER).append(";'>").append(ReportComponents.formatCurrency(comm.getAmount())).append("</td>")
                        .append("</tr>");
                }
                html.append("</tbody></table>");
            }
            
            ReportComponents.endPage(html, pageNum++);
        }

        // --- PAGE 6: HISTORICAL OUTLOOK ---
        if (data.getHistoricalOutlook() != null && !data.getHistoricalOutlook().isEmpty()) {
            ReportComponents.startPage(html, "Perspectiva Histórica", "Últimos 6 meses");
            
            html.append("<h2>Evolução Mensal</h2>");
            html.append("<table><thead><tr><th>Mês</th><th>Receita</th><th>Despesa</th><th style='text-align: right;'>Taxa Econ.</th></tr></thead><tbody>");
            for (MonthlyReportResponse.HistoricalOutlookPoint point : data.getHistoricalOutlook()) {
                html.append("<tr>")
                    .append("<td>").append(point.getLabel()).append("</td>")
                    .append("<td>").append(ReportComponents.formatCurrency(point.getIncome())).append("</td>")
                    .append("<td>").append(ReportComponents.formatCurrency(point.getExpense())).append("</td>")
                    .append("<td style='text-align: right;'>").append(point.getSavingsRate()).append("%</td>")
                    .append("</tr>");
            }
            html.append("</tbody></table>");

            // Recommendations
            if (data.getAiAnalysis() != null && data.getAiAnalysis().getRecommendations() != null) {
                html.append("<div class='card' style='margin-top: 30pt;'>");
                html.append("<h3 class='text-accent'>Recomendações Práticas</h3>");
                html.append("<ul style='padding-left: 20pt;'>");
                for (String r : data.getAiAnalysis().getRecommendations()) {
                    html.append("<li style='margin-bottom: 8pt;'>").append(r).append("</li>");
                }
                html.append("</ul>");
                html.append("</div>");
            }
            
            ReportComponents.endPage(html, pageNum++);
        }

        html.append("</body></html>");
        return html.toString();
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
