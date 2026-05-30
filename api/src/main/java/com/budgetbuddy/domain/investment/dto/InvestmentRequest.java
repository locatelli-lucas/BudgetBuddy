package com.budgetbuddy.domain.investment.dto;

import com.budgetbuddy.domain.investment.Investment.InvestmentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentRequest {

    @NotBlank(message = "Ticker is required")
    private String ticker;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private InvestmentType type;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000001", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotNull(message = "Average price is required")
    @DecimalMin(value = "0.01", message = "Average price must be greater than zero")
    private BigDecimal avgPrice;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;
}
