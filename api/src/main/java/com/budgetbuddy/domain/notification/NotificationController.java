package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.notification.dto.*;
import com.budgetbuddy.shared.response.ApiResponse;
import com.budgetbuddy.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final PriceAlertService priceAlertService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Notification.NotificationCategory category,
            @RequestParam(required = false) Boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getNotifications(userDetails.getUsername(), category, unreadOnly, page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getUnreadCount(userDetails.getUsername())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        notificationService.markAsRead(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        notificationService.deleteNotification(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/device-token")
    public ResponseEntity<ApiResponse<Void>> registerDeviceToken(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DeviceTokenRequest request) {
        notificationService.registerDeviceToken(userDetails.getUsername(), request.getToken());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getPreferences(userDetails.getUsername())));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NotificationPreferenceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.updatePreferences(userDetails.getUsername(), request)));
    }

    @GetMapping("/price-alerts")
    public ResponseEntity<ApiResponse<List<PriceAlertResponse>>> getPriceAlerts(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                priceAlertService.getPriceAlerts(userDetails.getUsername())));
    }

    @PostMapping("/price-alert")
    public ResponseEntity<ApiResponse<PriceAlertResponse>> createPriceAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PriceAlertRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                priceAlertService.createPriceAlert(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/price-alert/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePriceAlert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id) {
        priceAlertService.deletePriceAlert(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
