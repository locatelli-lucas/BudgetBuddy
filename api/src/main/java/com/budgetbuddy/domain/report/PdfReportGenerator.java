package com.budgetbuddy.domain.report;

import com.budgetbuddy.domain.report.dto.MonthlyReportResponse;
import com.itextpdf.html2pdf.HtmlConverter;
import com.budgetbuddy.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

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
        // Simple HTML template for iText to convert
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    h1 { color: #2563EB; }
                    .summary-grid { display: block; width: 100%%; margin-bottom: 20px; }
                    .summary-card { display: inline-block; width: 30%%; padding: 10px; background: #f8fafc; border-radius: 8px; margin-right: 2%%; }
                    .amount { font-size: 24px; font-weight: bold; }
                    .income { color: #22C55E; }
                    .expense { color: #EF4444; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BudgetBuddy Relatório Mensal</h1>
                    <p>Período: %02d/%d | Usuário: %s</p>
                </div>
                
                <div class="summary-grid">
                    <div class="summary-card">
                        <div>Receitas</div>
                        <div class="amount income">R$ %.2f</div>
                    </div>
                    <div class="summary-card">
                        <div>Despesas</div>
                        <div class="amount expense">R$ %.2f</div>
                    </div>
                    <div class="summary-card">
                        <div>Economizado</div>
                        <div class="amount">R$ %.2f</div>
                    </div>
                </div>
                
                <div style="margin-top: 30px;">
                    <h3>Resumo da IA</h3>
                    <p>%s</p>
                </div>
            </body>
            </html>
            """.formatted(
                data.getMonth(), data.getYear(), data.getUserName(),
                data.getTotalIncome(), data.getTotalExpense(), data.getNetSavings(),
                data.getAiSummary()
        );
    }
}
