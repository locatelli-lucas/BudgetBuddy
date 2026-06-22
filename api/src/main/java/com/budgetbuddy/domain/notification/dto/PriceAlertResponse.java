package com.budgetbuddy.domain.notification.dto;

import com.budgetbuddy.domain.notification.PriceAlert;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceAlertResponse {
    private UUID id;
    private String symbol;
    private PriceAlert.AlertCondition condition;
    private BigDecimal targetPrice;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime triggeredAt;
}
