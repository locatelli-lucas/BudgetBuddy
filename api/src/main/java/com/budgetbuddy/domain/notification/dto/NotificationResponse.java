package com.budgetbuddy.domain.notification.dto;

import com.budgetbuddy.domain.notification.Notification;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private Notification.NotificationType type;
    private Notification.NotificationCategory category;
    private Notification.NotificationPriority priority;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String actionUrl;
    private String metadata;
}
