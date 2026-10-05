package com.budgetbuddy.domain.transaction.dto;

import java.math.BigDecimal;

public record MonthlyFlowResponse(String month, BigDecimal income, BigDecimal expense) {}
