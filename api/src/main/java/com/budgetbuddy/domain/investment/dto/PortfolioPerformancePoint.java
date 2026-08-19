package com.budgetbuddy.domain.investment.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PortfolioPerformancePoint(
        LocalDate date,
        BigDecimal value
) {}
