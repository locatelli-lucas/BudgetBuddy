package com.budgetbuddy.domain.institution.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionResponse {
    private UUID id;
    private String name;
    private String brokerCode;
    private String logoUrl;
}
