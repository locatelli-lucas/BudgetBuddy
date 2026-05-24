package com.budgetbuddy.domain.investment.dto;

import com.budgetbuddy.domain.investment.Investment.InvestmentType;
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
public class InvestmentResponse {
    private UUID id;
    private String ticker;
    private String name;
    private InvestmentType type;
    private BigDecimal quantity;
    private BigDecimal avgPrice;
    private LocalDate purchaseDate;
    
    // Calculated fields based on market data (to be added via Yahoo Finance later)
    private BigDecimal currentPrice;
    private BigDecimal currentValue;
    private BigDecimal returnPercent;
}
