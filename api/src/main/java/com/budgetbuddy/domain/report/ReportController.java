package com.budgetbuddy.domain.report;

import com.budgetbuddy.domain.report.dto.MonthlyReportResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final PdfReportGenerator pdfReportGenerator;

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<MonthlyReportResponse>> getMonthlyReportData(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
            
        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            return ResponseEntity.ok(ApiResponse.success(
                    reportService.getReportForPeriod(userDetails.getUsername(), start, end, null, null)));
        }

        LocalDate now = LocalDate.now();
        int targetMonth = (month != null && month > 0) ? month : now.getMonthValue();
        int targetYear = (year != null && year > 0) ? year : now.getYear();
        
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getMonthlyReport(userDetails.getUsername(), targetMonth, targetYear)));
    }
    
    @GetMapping(value = "/monthly/pdf", produces = "application/pdf")
    public ResponseEntity<byte[]> getMonthlyPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "true") boolean includeCharts,
            @RequestParam(defaultValue = "true") boolean includeAi,
            @RequestParam(defaultValue = "true") boolean includeCategories,
            @RequestParam(defaultValue = "false") boolean includeComparison) {
            
        byte[] pdfBytes;
        if (startDate != null && !startDate.isBlank() && endDate != null && !endDate.isBlank()) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            pdfBytes = pdfReportGenerator.generateCustomPdfReport(
                    userDetails.getUsername(), start, end, 
                    includeCharts, includeAi, includeCategories, includeComparison);
        } else {
            LocalDate now = LocalDate.now();
            int targetMonth = (month != null && month > 0) ? month : now.getMonthValue();
            int targetYear = (year != null && year > 0) ? year : now.getYear();
            pdfBytes = pdfReportGenerator.generateMonthlyPdfReport(
                    userDetails.getUsername(), targetMonth, targetYear, 
                    includeCharts, includeAi, includeCategories, includeComparison);
        }
        
        String filename = "budgetbuddy-report-" + (startDate != null ? startDate : month + "-" + year) + ".pdf";
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .body(pdfBytes);
    }
}
