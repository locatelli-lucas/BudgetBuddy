package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.notification.dto.NotificationResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import com.budgetbuddy.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    // Will inject FcmService later

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(String email, int page, int size) {
        User user = userService.getUserByEmail(email);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderBySentAtDesc(user.getId(), pageable);
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
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userService.getUserByEmail(email);
        notificationRepository.markAllAsReadForUser(user.getId());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .body(notification.getBody())
                .type(notification.getType())
                .isRead(notification.isRead())
                .sentAt(notification.getSentAt())
                .build();
    }
    
    // Internal method for other services to create notifications
    @Transactional
    public void createAndSendNotification(User user, String title, String body, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .body(body)
                .type(type)
                .isRead(false)
                .build();
                
        notificationRepository.save(notification);
        
        // TODO: In Phase 6, trigger FcmService to send actual push notification if user has fcmToken
    }
}
