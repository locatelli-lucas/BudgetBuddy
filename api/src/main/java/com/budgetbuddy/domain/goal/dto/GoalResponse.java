package com.budgetbuddy.domain.goal.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
public class GoalResponse {
    private UUID id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private BigDecimal progressPercent;
    private LocalDate deadline;
    private String color;
    private String icon;
    private boolean isCompleted;
}
