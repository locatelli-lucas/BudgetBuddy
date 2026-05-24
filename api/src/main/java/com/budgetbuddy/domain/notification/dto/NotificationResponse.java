package com.budgetbuddy.domain.notification.dto;

import com.budgetbuddy.domain.notification.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String title;
    private String body;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime sentAt;
}
