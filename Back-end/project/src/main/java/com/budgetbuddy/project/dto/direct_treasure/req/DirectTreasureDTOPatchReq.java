package com.budgetbuddy.project.dto.direct_treasure.req;

import com.budgetbuddy.project.entities.DirectTreasure;

public record DirectTreasureDTOPatchReq(
        double profitability,
        double minInvestment,
        double unitPrice,
        double amountInvested
) {
}
