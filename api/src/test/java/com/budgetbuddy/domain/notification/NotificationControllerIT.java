package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.notification.dto.NotificationPreferenceRequest;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class NotificationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User user;
    private User otherUser;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        user = User.builder()
                .email("user@test.com")
                .name("User Test")
                .password("password")
                .build();
        user = userRepository.save(user);

        otherUser = User.builder()
                .email("other@test.com")
                .name("Other Test")
                .password("password")
                .build();
        otherUser = userRepository.save(otherUser);
    }

    @Test
    @WithMockUser(username = "user@test.com")
    @DisplayName("Should list notifications for authenticated user")
    void shouldListNotifications() throws Exception {
        Notification n1 = Notification.builder()
                .user(user)
                .title("T1")
                .message("M1")
                .type(Notification.NotificationType.INFO)
                .category(Notification.NotificationCategory.SYSTEM)
                .priority(Notification.NotificationPriority.MEDIUM)
                .build();
        notificationRepository.save(n1);

        Notification n2 = Notification.builder()
                .user(otherUser)
                .title("T2")
                .message("M2")
                .type(Notification.NotificationType.INFO)
                .category(Notification.NotificationCategory.SYSTEM)
                .priority(Notification.NotificationPriority.MEDIUM)
                .build();
        notificationRepository.save(n2);

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].title").value("T1"));
    }

    @Test
    @WithMockUser(username = "user@test.com")
    @DisplayName("Should not be able to mark other user's notification as read")
    void shouldNotMarkOtherUserRead() throws Exception {
        Notification n2 = Notification.builder()
                .user(otherUser)
                .title("T2")
                .message("M2")
                .type(Notification.NotificationType.INFO)
                .category(Notification.NotificationCategory.SYSTEM)
                .priority(Notification.NotificationPriority.MEDIUM)
                .build();
        n2 = notificationRepository.save(n2);

        mockMvc.perform(put("/api/v1/notifications/" + n2.getId() + "/read"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user@test.com")
    @DisplayName("Should not be able to delete other user's notification")
    void shouldNotDeleteOtherUserNotif() throws Exception {
        Notification n2 = Notification.builder()
                .user(otherUser)
                .title("T2")
                .message("M2")
                .type(Notification.NotificationType.INFO)
                .category(Notification.NotificationCategory.SYSTEM)
                .priority(Notification.NotificationPriority.MEDIUM)
                .build();
        n2 = notificationRepository.save(n2);

        mockMvc.perform(delete("/api/v1/notifications/" + n2.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user@test.com")
    @DisplayName("Should get preferences")
    void shouldGetPreferences() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/preferences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pushEnabled").value(true));
    }

    @Test
    @WithMockUser(username = "user@test.com")
    @DisplayName("Should update preferences")
    void shouldUpdatePreferences() throws Exception {
        NotificationPreferenceRequest request = NotificationPreferenceRequest.builder()
                .pushEnabled(false)
                .financeEnabled(true)
                .investmentEnabled(false)
                .aiEnabled(true)
                .systemEnabled(false)
                .build();

        mockMvc.perform(put("/api/v1/notifications/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pushEnabled").value(false))
                .andExpect(jsonPath("$.data.investmentEnabled").value(false));
    }
}
