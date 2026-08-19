package com.budgetbuddy.infrastructure.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponse {
    private String ticker;
    private String name;
    private BigDecimal price;
    private BigDecimal change;
    private BigDecimal changePercent;
}
