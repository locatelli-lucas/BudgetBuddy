package com.budgetbuddy.domain.auth;

import com.budgetbuddy.domain.auth.dto.GoogleLoginRequest;
import com.budgetbuddy.domain.auth.dto.LoginRequest;
import com.budgetbuddy.domain.auth.dto.LoginResponse;
import com.budgetbuddy.domain.auth.dto.RefreshRequest;
import com.budgetbuddy.domain.auth.dto.RegisterRequest;
import com.budgetbuddy.domain.auth.dto.TwoFactorLoginRequest;
import com.budgetbuddy.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request)));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<LoginResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.googleLogin(request)));
    }

    @PostMapping("/google/link")
    public ResponseEntity<ApiResponse<Void>> linkGoogle(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody GoogleLoginRequest request) {
        authService.linkGoogle(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/google/unlink")
    public ResponseEntity<ApiResponse<Void>> unlinkGoogle(@AuthenticationPrincipal UserDetails userDetails) {
        authService.unlinkGoogle(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse<List<AuthProvider>>> getProviders(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(authService.getConnectedProviders(userDetails.getUsername())));
    }

    @PostMapping("/2fa")
    public ResponseEntity<ApiResponse<LoginResponse>> verify2fa(@Valid @RequestBody TwoFactorLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.verify2fa(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
