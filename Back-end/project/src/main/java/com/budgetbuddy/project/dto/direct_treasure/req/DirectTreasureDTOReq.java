package com.budgetbuddy.project.dto.direct_treasure.req;

import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.entities.Portfolio;
import com.google.type.Date;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DirectTreasureDTOReq(
        Long id,

        @NotNull
        @NotBlank
        String name,

        double profitability,

        double minInvestment,

        double unitPrice,

        Date dueDate,

        double amountInvestment,

        Portfolio portfolio
) {
    public DirectTreasure dtoToDirectTreasure() {
        return new DirectTreasure(
                this.name,
                this.profitability,
                this.minInvestment,
                this.unitPrice,
                this.dueDate,
                this.amountInvestment,
                this.portfolio
        );
    }
}
