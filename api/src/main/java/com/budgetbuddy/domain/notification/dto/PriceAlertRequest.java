package com.budgetbuddy.domain.notification.dto;

import com.budgetbuddy.domain.notification.PriceAlert;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceAlertRequest {
    @NotBlank
    private String symbol;

    @NotNull
    private PriceAlert.AlertCondition condition;

    @NotNull
    @Positive
    private BigDecimal targetPrice;
}
