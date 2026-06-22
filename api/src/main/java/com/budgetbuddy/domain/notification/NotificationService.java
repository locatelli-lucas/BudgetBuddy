package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.notification.dto.*;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.infrastructure.fcm.FcmService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import com.budgetbuddy.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UserService userService;
    private final FcmService fcmService;

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(String email, Notification.NotificationCategory category, Boolean unreadOnly, int page, int size) {
        User user = userService.getUserByEmail(email);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Notification> notificationPage;
        if (unreadOnly != null && unreadOnly) {
            notificationPage = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId(), pageable);
        } else if (category != null) {
            notificationPage = notificationRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(user.getId(), category, pageable);
        } else {
            notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        }
        
        return PageResponse.of(notificationPage.map(this::mapToResponse));
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userService.getUserByEmail(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Notification", id.toString()));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userService.getUserByEmail(email);
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    @Transactional
    public void deleteNotification(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        Notification notification = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Notification", id.toString()));
        notificationRepository.delete(notification);
    }

    @Transactional
    public void registerDeviceToken(String email, String token) {
        User user = userService.getUserByEmail(email);
        deviceTokenRepository.findByUserIdAndToken(user.getId(), token)
                .ifPresentOrElse(
                    dt -> {
                        dt.setLastUsedAt(LocalDateTime.now());
                        deviceTokenRepository.save(dt);
                    },
                    () -> {
                        DeviceToken dt = DeviceToken.builder()
                                .user(user)
                                .token(token)
                                .build();
                        deviceTokenRepository.save(dt);
                    }
                );
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences(String email) {
        User user = userService.getUserByEmail(email);
        NotificationPreference prefs = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));
        return mapToPreferenceResponse(prefs);
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(String email, NotificationPreferenceRequest request) {
        User user = userService.getUserByEmail(email);
        NotificationPreference prefs = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));
        
        prefs.setPushEnabled(request.isPushEnabled());
        prefs.setFinanceEnabled(request.isFinanceEnabled());
        prefs.setInvestmentEnabled(request.isInvestmentEnabled());
        prefs.setNewsEnabled(request.isNewsEnabled());
        prefs.setAiEnabled(request.isAiEnabled());
        prefs.setSystemEnabled(request.isSystemEnabled());
        prefs.setPriceAlertEnabled(request.isPriceAlertEnabled());
        prefs.setDividendAlertEnabled(request.isDividendAlertEnabled());
        prefs.setDailySummaryEnabled(request.isDailySummaryEnabled());
        prefs.setWeeklySummaryEnabled(request.isWeeklySummaryEnabled());
        prefs.setMonthlySummaryEnabled(request.isMonthlySummaryEnabled());
        
        return mapToPreferenceResponse(preferenceRepository.save(prefs));
    }

    @Transactional
    public void createAndSendNotification(User user, String title, String message, 
                                           Notification.NotificationType type, 
                                           Notification.NotificationCategory category,
                                           Notification.NotificationPriority priority,
                                           String actionUrl, Map<String, String> metadata) {
        
        NotificationPreference prefs = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));
        
        boolean enabled = isCategoryEnabled(category, prefs);
        
        if (enabled) {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .type(type)
                    .category(category)
                    .priority(priority)
                    .actionUrl(actionUrl)
                    .metadata(metadata != null ? metadata.toString() : null)
                    .build();
                    
            notificationRepository.save(notification);
            
            if (prefs.isPushEnabled()) {
                List<DeviceToken> tokens = deviceTokenRepository.findByUserId(user.getId());
                Map<String, String> pushData = new HashMap<>();
                if (actionUrl != null) pushData.put("actionUrl", actionUrl);
                if (metadata != null) pushData.putAll(metadata);
                pushData.put("category", category.name());
                
                for (DeviceToken dt : tokens) {
                    fcmService.sendPushNotification(dt.getToken(), title, message, pushData);
                }
            }
        }
    }

    private boolean isCategoryEnabled(Notification.NotificationCategory category, NotificationPreference prefs) {
        return switch (category) {
            case FINANCE -> prefs.isFinanceEnabled();
            case INVESTMENTS -> prefs.isInvestmentEnabled();
            case NEWS -> prefs.isNewsEnabled();
            case AI -> prefs.isAiEnabled();
            case SYSTEM -> prefs.isSystemEnabled();
        };
    }

    private NotificationPreference createDefaultPreferences(User user) {
        NotificationPreference prefs = NotificationPreference.builder()
                .user(user)
                .build();
        return preferenceRepository.save(prefs);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .category(notification.getCategory())
                .priority(notification.getPriority())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .actionUrl(notification.getActionUrl())
                .metadata(notification.getMetadata())
                .build();
    }

    private NotificationPreferenceResponse mapToPreferenceResponse(NotificationPreference prefs) {
        return NotificationPreferenceResponse.builder()
                .id(prefs.getId())
                .pushEnabled(prefs.isPushEnabled())
                .financeEnabled(prefs.isFinanceEnabled())
                .investmentEnabled(prefs.isInvestmentEnabled())
                .newsEnabled(prefs.isNewsEnabled())
                .aiEnabled(prefs.isAiEnabled())
                .systemEnabled(prefs.isSystemEnabled())
                .priceAlertEnabled(prefs.isPriceAlertEnabled())
                .dividendAlertEnabled(prefs.isDividendAlertEnabled())
                .dailySummaryEnabled(prefs.isDailySummaryEnabled())
                .weeklySummaryEnabled(prefs.isWeeklySummaryEnabled())
                .monthlySummaryEnabled(prefs.isMonthlySummaryEnabled())
                .build();
    }
}
