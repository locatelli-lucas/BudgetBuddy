package com.budgetbuddy.domain.auth.dto;

import com.budgetbuddy.domain.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private UserResponse user;
    
    @Builder.Default
    private boolean requires2FA = false;
    private String temporaryToken;
    private List<String> backupCodes;
}
