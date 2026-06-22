package com.budgetbuddy.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials-path}")
    private String credentialsPath;

    @Value("${firebase.project-id}")
    private String projectId;

    @Bean
    public FirebaseApp firebaseApp() {
        try {
            FileInputStream serviceAccount = new FileInputStream(credentialsPath);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setProjectId(projectId)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully");
            }
            return FirebaseApp.getInstance();
        } catch (IOException e) {
            log.warn("Failed to initialize Firebase: {}. Push notifications will not work.", e.getMessage());
            // We return null so the bean is not created, but we need to handle this downstream
            return null;
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(@Autowired(required = false) FirebaseApp firebaseApp) {
        if (firebaseApp == null) {
            log.warn("FirebaseApp is null, FirebaseMessaging bean will not be created");
            return null;
        }
        return FirebaseMessaging.getInstance(firebaseApp);
    }
}
