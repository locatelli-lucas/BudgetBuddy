package com.budgetbuddy.domain.goal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class GoalRequest {
    @NotBlank
    private String name;

    @NotNull
    @Positive
    private BigDecimal targetAmount;

    private BigDecimal currentAmount;
    private LocalDate deadline;
    private String color;
    private String icon;
}
