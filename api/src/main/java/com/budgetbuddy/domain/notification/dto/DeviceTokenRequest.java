package com.budgetbuddy.domain.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTokenRequest {
    @NotBlank
    private String token;
}
