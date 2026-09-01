package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.notification.dto.NotificationPreferenceRequest;
import com.budgetbuddy.domain.notification.dto.NotificationPreferenceResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.infrastructure.fcm.FcmService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private DeviceTokenRepository deviceTokenRepository;

    @Mock
    private UserService userService;

    @Mock
    private FcmService fcmService;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private Notification notification;
    private NotificationPreference preferences;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        notification = Notification.builder()
                .id(UUID.randomUUID())
                .user(user)
                .title("Test Title")
                .message("Test Message")
                .type(Notification.NotificationType.INFO)
                .category(Notification.NotificationCategory.SYSTEM)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        preferences = NotificationPreference.builder()
                .user(user)
                .pushEnabled(true)
                .systemEnabled(true)
                .financeEnabled(true)
                .investmentEnabled(true)
                .build();
    }

    @Test
    @DisplayName("Should return unread count for user")
    void shouldReturnUnreadCount() {
        when(userService.getUserByEmail(user.getEmail())).thenReturn(user);
        when(notificationRepository.countByUserIdAndIsReadFalse(user.getId())).thenReturn(5L);

        long count = notificationService.getUnreadCount(user.getEmail());

        assertThat(count).isEqualTo(5L);
        verify(notificationRepository).countByUserIdAndIsReadFalse(user.getId());
    }

    @Test
    @DisplayName("Should mark notification as read")
    void shouldMarkAsRead() {
        when(userService.getUserByEmail(user.getEmail())).thenReturn(user);
        when(notificationRepository.findByIdAndUserId(notification.getId(), user.getId()))
                .thenReturn(Optional.of(notification));

        notificationService.markAsRead(user.getEmail(), notification.getId());

        assertThat(notification.isRead()).isTrue();
        assertThat(notification.getReadAt()).isNotNull();
        verify(notificationRepository).save(notification);
    }

    @Test
    @DisplayName("Should throw exception when marking non-existent notification as read")
    void shouldThrowExceptionWhenNotFound() {
        UUID randomId = UUID.randomUUID();
        when(userService.getUserByEmail(user.getEmail())).thenReturn(user);
        when(notificationRepository.findByIdAndUserId(randomId, user.getId()))
                .thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> 
            notificationService.markAsRead(user.getEmail(), randomId)
        );
    }

    @Test
    @DisplayName("Should mark all as read")
    void shouldMarkAllAsRead() {
        when(userService.getUserByEmail(user.getEmail())).thenReturn(user);

        notificationService.markAllAsRead(user.getEmail());

        verify(notificationRepository).markAllAsReadForUser(user.getId());
    }

    @Test
    @DisplayName("Should update preferences")
    void shouldUpdatePreferences() {
        when(userService.getUserByEmail(user.getEmail())).thenReturn(user);
        when(preferenceRepository.findByUserId(user.getId())).thenReturn(Optional.of(preferences));
        when(preferenceRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        NotificationPreferenceRequest request = NotificationPreferenceRequest.builder()
                .pushEnabled(false)
                .systemEnabled(false)
                .build();

        NotificationPreferenceResponse response = notificationService.updatePreferences(user.getEmail(), request);

        assertThat(response.isPushEnabled()).isFalse();
        assertThat(response.isSystemEnabled()).isFalse();
        verify(preferenceRepository).save(any());
    }

    @Test
    @DisplayName("Should create and send notification when category is enabled")
    void shouldCreateAndSendNotification() {
        when(preferenceRepository.findByUserId(user.getId())).thenReturn(Optional.of(preferences));
        when(deviceTokenRepository.findByUserId(user.getId())).thenReturn(List.of(
                DeviceToken.builder().token("token1").build()
        ));

        notificationService.createAndSendNotification(
                user, "Title", "Msg", 
                Notification.NotificationType.INFO, 
                Notification.NotificationCategory.SYSTEM, 
                Notification.NotificationPriority.MEDIUM, 
                null, null
        );

        verify(notificationRepository).save(any(Notification.class));
        verify(fcmService).sendPushNotification(eq("token1"), anyString(), anyString(), anyMap());
    }

    @Test
    @DisplayName("Should NOT send push when push is disabled in preferences")
    void shouldNotSendPushWhenDisabled() {
        preferences.setPushEnabled(false);
        when(preferenceRepository.findByUserId(user.getId())).thenReturn(Optional.of(preferences));

        notificationService.createAndSendNotification(
                user, "Title", "Msg", 
                Notification.NotificationType.INFO, 
                Notification.NotificationCategory.SYSTEM, 
                Notification.NotificationPriority.MEDIUM, 
                null, null
        );

        verify(notificationRepository).save(any(Notification.class));
        verify(fcmService, never()).sendPushNotification(anyString(), anyString(), anyString(), anyMap());
    }

    @Test
    @DisplayName("Should NOT create notification when category is disabled")
    void shouldNotCreateNotificationWhenCategoryDisabled() {
        preferences.setSystemEnabled(false);
        when(preferenceRepository.findByUserId(user.getId())).thenReturn(Optional.of(preferences));

        notificationService.createAndSendNotification(
                user, "Title", "Msg", 
                Notification.NotificationType.INFO, 
                Notification.NotificationCategory.SYSTEM, 
                Notification.NotificationPriority.MEDIUM, 
                null, null
        );

        verify(notificationRepository, never()).save(any(Notification.class));
    }
}
