package com.budgetbuddy.domain.financialresource.dto;

import com.budgetbuddy.domain.financialresource.FinancialResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialResourceRequest {

    private UUID financialInstitutionId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private FinancialResourceType type;

    private String brand;
    private String color;
    private String lastFourDigits;
    private BigDecimal creditLimit;
    private BigDecimal currentBalance;
    private Integer invoiceClosingDay;
    private Integer invoiceDueDay;
    @Builder.Default
    private boolean isActive = true;
}
