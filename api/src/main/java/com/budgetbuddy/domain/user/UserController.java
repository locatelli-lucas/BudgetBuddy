package com.budgetbuddy.domain.user;

import com.budgetbuddy.domain.notification.dto.NotificationPreferenceRequest;
import com.budgetbuddy.domain.notification.dto.NotificationPreferenceResponse;
import com.budgetbuddy.domain.user.dto.ChangePasswordRequest;
import com.budgetbuddy.domain.user.dto.DeleteAccountRequest;
import com.budgetbuddy.domain.user.dto.FcmTokenRequest;
import com.budgetbuddy.domain.user.dto.TwoFactorCodeRequest;
import com.budgetbuddy.domain.user.dto.UpdateUserRequest;
import com.budgetbuddy.domain.user.dto.UserResponse;
import com.budgetbuddy.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final TwoFactorService twoFactorService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserProfile(userDetails.getUsername())));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(userDetails.getUsername(), request)));
    }

    @PutMapping("/me/fcm-token")
    public ResponseEntity<ApiResponse<Void>> updateFcmToken(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody FcmTokenRequest request) {
        userService.updateFcmToken(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/me/notification-preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getNotificationPreferences(userDetails.getUsername())));
    }

    @PutMapping("/me/notification-preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updateNotificationPreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NotificationPreferenceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateNotificationPreferences(userDetails.getUsername(), request)));
    }

    @PostMapping("/me/2fa/setup")
    public ResponseEntity<ApiResponse<Map<String, String>>> setupTwoFactor(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                twoFactorService.setupTwoFactor(userDetails.getUsername())));
    }

    @PostMapping("/me/2fa/enable")
    public ResponseEntity<ApiResponse<Void>> enableTwoFactor(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TwoFactorCodeRequest request) {
        twoFactorService.enableTwoFactor(userDetails.getUsername(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/me/2fa/disable")
    public ResponseEntity<ApiResponse<Void>> disableTwoFactor(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TwoFactorCodeRequest request) {
        twoFactorService.disableTwoFactor(userDetails.getUsername(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DeleteAccountRequest request) {
        userService.deleteAccount(userDetails.getUsername(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
