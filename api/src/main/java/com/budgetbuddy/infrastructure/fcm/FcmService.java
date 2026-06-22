package com.budgetbuddy.infrastructure.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class FcmService {

    private final FirebaseMessaging firebaseMessaging;

    @Autowired
    public FcmService(@Autowired(required = false) FirebaseMessaging firebaseMessaging) {
        this.firebaseMessaging = firebaseMessaging;
    }
    
    public void sendPushNotification(String token, String title, String body, Map<String, String> data) {
        if (token == null || token.isEmpty()) {
            log.debug("Cannot send push notification, user FCM token is null");
            return;
        }

        if (firebaseMessaging == null) {
            log.warn("FirebaseMessaging is not initialized. Mocking notification for token {}: {} - {}", token, title, body);
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
            
            String response = firebaseMessaging.send(message);
            log.info("Successfully sent FCM message: {}", response);
            
        } catch (Exception e) {
            log.error("Failed to send FCM notification to token {}", token, e);
        }
    }
}
