package com.budgetbuddy.project.dto.portfolio.res;

import com.budgetbuddy.project.entities.DirectTreasure;
import com.budgetbuddy.project.entities.Portfolio;
import com.budgetbuddy.project.entities.Stock;
import com.budgetbuddy.project.entities.User;

import java.util.List;

public record PortfolioDTORes(
        Long id,
        User user,
        List<Stock> stockList,
        List<DirectTreasure> directTreasure
) {
    public static PortfolioDTORes portfolioToDto(Portfolio portfolio) {
        return new PortfolioDTORes(
                portfolio.getId(),
                portfolio.getUser(),
                portfolio.getStockList(),
                portfolio.getDirectTreasure()
        );

    }
}
