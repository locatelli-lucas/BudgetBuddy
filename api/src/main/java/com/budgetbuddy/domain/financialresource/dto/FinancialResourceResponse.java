package com.budgetbuddy.domain.financialresource.dto;

import com.budgetbuddy.domain.financialinstitution.dto.FinancialInstitutionResponse;
import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialResourceResponse {
    private UUID id;
    private String name;
    private FinancialResourceType type;
    private String brand;
    private String color;
    private String lastFourDigits;
    private BigDecimal creditLimit;
    private BigDecimal currentBalance;
    private Integer invoiceClosingDay;
    private Integer invoiceDueDay;
    private boolean isActive;
    private FinancialInstitutionResponse financialInstitution;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
