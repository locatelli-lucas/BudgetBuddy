package com.budgetbuddy.project.dto.direct_treasure.req;

import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.entities.Portfolio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record DirectTreasureDTOReq(
        Long id,

        @NotNull
        @NotBlank
        String name,

        double profitability,

        double minInvestment,

        double unitPrice,

        Date dueDate,

        double amountInvested,

        Portfolio portfolio
) {
    public DirectTreasure dtoToDirectTreasure() {
        return new DirectTreasure(
                this.name,
                this.profitability,
                this.minInvestment,
                this.unitPrice,
                this.dueDate,
                this.amountInvested,
                this.portfolio
        );
    }

    public DirectTreasure dtoToDirectTreasure(Long id) {
        return new DirectTreasure(
                id,
                this.name,
                this.profitability,
                this.minInvestment,
                this.unitPrice,
                this.dueDate,
                this.amountInvested,
                this.portfolio
        );
    }
}
