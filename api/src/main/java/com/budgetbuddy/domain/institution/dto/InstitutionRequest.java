package com.budgetbuddy.domain.institution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 150, message = "Name must be between 1 and 150 characters")
    private String name;

    @Size(max = 50, message = "Broker code must not exceed 50 characters")
    private String brokerCode;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;
}
