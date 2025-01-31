package com.budgetbuddy.project.dto.stock.req;

import com.budgetbuddy.project.entities.Portfolio;
import com.budgetbuddy.project.entities.Stock;
import com.budgetbuddy.project.types.InvestmentTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record StockDTOReq(
        Long id,

        @NotNull
        @NotBlank
        String code,

        @NotBlank
        String name,

        @NotBlank
        double currentPrice,

        double acquisitionPrice,

        Date acquisitionDate,

        @NotBlank
        int quantity,

        @NotNull
        Portfolio portfolio
) {
    public Stock dtoToStock() {
        return new Stock(
                this.code,
                this.name,
                this.currentPrice,
                this.acquisitionPrice,
                this.acquisitionDate,
                this.quantity,
                this.portfolio
        );
    }

    public Stock dtoToStock(Long id) {
        return new Stock(
                id,
                this.code,
                this.name,
                this.currentPrice,
                this.acquisitionPrice,
                this.acquisitionDate,
                this.quantity,
                this.portfolio
        );
    }
}
