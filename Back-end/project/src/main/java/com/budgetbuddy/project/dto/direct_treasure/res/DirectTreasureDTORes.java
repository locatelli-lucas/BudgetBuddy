package com.budgetbuddy.project.dto.direct_treasure.res;

import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.entities.Portfolio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record DirectTreasureDTORes(
        Long id,

        @NotBlank
        @NotNull
        String name,

        double profitability,

        double minInvestment,

        double unitPrice,

        Date dueDate,

        double amountInvested,

        Long portfolioId
) {
    public static DirectTreasureDTORes directTreasureToDto(DirectTreasure directTreasure) {
        return new DirectTreasureDTORes(
                directTreasure.getId(),
                directTreasure.getName(),
                directTreasure.getProfitability(),
                directTreasure.getMinInvestment(),
                directTreasure.getUnitPrice(),
                directTreasure.getDueDate(),
                directTreasure.getAmountInvested(),
                directTreasure.getPortfolio().getId()
        );
    }
}
