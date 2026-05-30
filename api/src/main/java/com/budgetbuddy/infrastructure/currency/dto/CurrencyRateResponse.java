package com.budgetbuddy.infrastructure.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyRateResponse {
    private String code;
    private String codein;
    private String name;
    private BigDecimal bid;
    private BigDecimal ask;
    private String createDate;
}
