package com.budgetbuddy.domain.financialresource.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupedFinancialResourcesResponse {
    private BigDecimal netWorth;
    private List<FinancialInstitutionGroupResponse> institutions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialInstitutionGroupResponse {
        private String institutionName;
        private String logoUrl;
        private BigDecimal totalBalance;
        private int resourceCount;
        private List<FinancialResourceResponse> financialResources;
    }
}
