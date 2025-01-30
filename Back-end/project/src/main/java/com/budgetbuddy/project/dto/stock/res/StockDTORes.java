package com.budgetbuddy.project.dto.stock.res;

import com.budgetbuddy.project.entities.Stock;

public record StockDTORes(
        Long id,
        String type,
        String code,
        String name,
        double currentPrice,
        double acquisitionPrice,
        String acquisitionDate,
        int quantity,
        Long portfolioId
) {
    public static StockDTORes stockToDTO(Stock stock) {
        return new StockDTORes(
                stock.getId(),
                stock.getType().name(),
                stock.getCode(),
                stock.getName(),
                stock.getCurrentPrice(),
                stock.getAcquisitionPrice(),
                stock.getAcquisitionDate().toString(),
                stock.getQuantity(),
                stock.getPortfolio().getId()
        );
    }
}
