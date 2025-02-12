package com.budgetbuddy.project.dto.stock.req;

import jakarta.validation.constraints.NotBlank;
import java.util.Date;

public record StockDTOPatchReq(

        @NotBlank
        double currentPrice,

        @NotBlank
        double acquisitionPrice,

        @NotBlank
        Date acquisitionDate,

        @NotBlank
        int quantity
) {
}
