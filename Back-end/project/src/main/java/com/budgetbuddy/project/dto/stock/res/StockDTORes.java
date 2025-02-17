package com.budgetbuddy.project.dto.stock.res;

import com.budgetbuddy.project.entities.Stock;

public record StockDTORes(
        Long id,
        String code,
        String name,
        int quantity,
        double amountInvested,
        Long portfolioId
) {
    public static StockDTORes stockToDTO(Stock stock) {
        return new StockDTORes(
                stock.getId(),
                stock.getCode(),
                stock.getName(),
                stock.getQuantity(),
                stock.getAmountInvested(),
                stock.getPortfolio().getId()
        );
    }
}
