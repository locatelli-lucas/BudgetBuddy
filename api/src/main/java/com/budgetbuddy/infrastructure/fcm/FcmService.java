package com.budgetbuddy.infrastructure.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmService {

    // FirebaseMessaging would be injected here if Firebase was initialized
    
    public void sendPushNotification(String token, String title, String body, Map<String, String> data) {
        if (token == null || token.isEmpty()) {
            log.debug("Cannot send push notification, user FCM token is null");
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(token)
                    .setNotification(notification);

            if (data != null && !data.isEmpty()) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            
            // In a real scenario with Firebase configured:
            // String response = FirebaseMessaging.getInstance().send(message);
            // log.info("Successfully sent FCM message: {}", response);
            
            log.info("Mock FCM notification sent to token {}: {} - {}", token, title, body);

        } catch (Exception e) {
            log.error("Failed to send FCM notification", e);
        }
    }
}
