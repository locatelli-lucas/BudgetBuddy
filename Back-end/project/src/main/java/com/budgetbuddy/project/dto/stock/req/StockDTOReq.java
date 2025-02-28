package com.budgetbuddy.project.dto.stock.req;

import com.budgetbuddy.project.entities.Portfolio;
import com.budgetbuddy.project.entities.Stock;
import com.budgetbuddy.project.types.InvestmentTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record StockDTOReq(
        @NotNull(message = "code is mandatory")
        @NotBlank(message = "code is mandatory")
        String code,

        @NotBlank(message = "name is mandatory")
        String name,

        @NotBlank(message = "quantity is mandatory")
        @NotNull(message = "quantity is mandatory")
        int quantity,

        @NotNull(message = "amount invested is mandatory")
        @NotBlank(message = "amount invested is mandatory")
        int amountInvested,

        double acquisitionPrice,

        Date acquisitionDate,

        @NotNull
        Portfolio portfolio
) {
    public Stock dtoToStock() {
        return new Stock(
                this.code,
                this.name,
                this.quantity,
                this.amountInvested,
                this.acquisitionPrice,
                this.acquisitionDate
        );
    }

    public Stock dtoToStock(Long id) {
        return new Stock(
                id,
                this.code,
                this.name,
                this.quantity,
                this.amountInvested,
                this.acquisitionPrice,
                this.acquisitionDate
        );
    }
}
