package com.budgetbuddy.project.dto.stock.req;

import jakarta.validation.constraints.NotBlank;
import java.util.Date;

public record StockDTOPatchReq(
        int quantity,
        double amountInvested,
        double acquisitionPrice,
        Date acquisitionDate
) {
}
