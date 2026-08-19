package com.budgetbuddy.domain.installment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentPurchaseRequest {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.01", message = "Total amount must be greater than zero")
    private BigDecimal totalAmount;

    @Min(value = 1, message = "Installments count must be at least 1")
    private int installmentsCount;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Financial resource ID is required")
    private UUID financialResourceId;
    
    // For historical data
    private boolean isHistorical;
    @Builder.Default
    private int firstInstallmentNumber = 1;
}
