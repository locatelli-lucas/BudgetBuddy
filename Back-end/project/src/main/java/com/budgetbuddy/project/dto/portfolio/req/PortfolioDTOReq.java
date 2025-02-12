package com.budgetbuddy.project.dto.portfolio.req;

import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.entities.Portfolio;
import com.budgetbuddy.project.entities.Stock;
import com.budgetbuddy.project.entities.User;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PortfolioDTOReq(
        @NotNull
        User user,

        @NotNull
        List<Stock> stockList,

        @NotNull
        List<DirectTreasure> directTreasure
) {

    public Portfolio dtoToPortfolio() {
        return new Portfolio(
                this.user,
                this.stockList,
                this.directTreasure);
    }

    public Portfolio dtoToPortfolio(Long id) {
        return new Portfolio(
                id,
                this.user,
                this.stockList,
                this.directTreasure);
    }
}
