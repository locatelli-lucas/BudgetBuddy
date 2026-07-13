package com.budgetbuddy.domain.installment.dto;

import com.budgetbuddy.domain.category.dto.CategoryResponse;
import com.budgetbuddy.domain.financialresource.dto.FinancialResourceResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentPurchaseResponse {
    private UUID id;
    private String description;
    private BigDecimal totalAmount;
    private int installmentsCount;
    private LocalDate purchaseDate;
    private CategoryResponse category;
    private FinancialResourceResponse financialResource;
    private List<InstallmentEntryResponse> installments;
}
