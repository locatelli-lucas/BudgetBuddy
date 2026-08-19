package com.budgetbuddy.domain.user;

import com.budgetbuddy.domain.notification.NotificationPreference;
import com.budgetbuddy.domain.notification.NotificationPreferenceRepository;
import com.budgetbuddy.domain.notification.dto.NotificationPreferenceRequest;
import com.budgetbuddy.domain.notification.dto.NotificationPreferenceResponse;
import com.budgetbuddy.domain.user.dto.ChangePasswordRequest;
import com.budgetbuddy.domain.user.dto.FcmTokenRequest;
import com.budgetbuddy.domain.user.dto.UpdateUserRequest;
import com.budgetbuddy.domain.user.dto.UserResponse;
import com.budgetbuddy.shared.exception.BusinessException;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationPreferenceRepository notificationPreferenceRepository;

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String email) {
        User user = getUserByEmail(email);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateUserRequest request) {
        User user = getUserByEmail(email);
        user.setName(request.getName());
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public void updateFcmToken(String email, FcmTokenRequest request) {
        User user = getUserByEmail(email);
        user.setFcmToken(request.getToken());
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Invalid current password");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getNotificationPreferences(String email) {
        User user = getUserByEmail(email);
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user));
        return mapToPreferenceResponse(pref);
    }

    @Transactional
    public NotificationPreferenceResponse updateNotificationPreferences(String email, NotificationPreferenceRequest request) {
        User user = getUserByEmail(email);
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> NotificationPreference.builder().user(user).build());

        pref.setPushEnabled(request.isPushEnabled());
        pref.setFinanceEnabled(request.isFinanceEnabled());
        pref.setInvestmentEnabled(request.isInvestmentEnabled());
        pref.setNewsEnabled(request.isNewsEnabled());
        pref.setAiEnabled(request.isAiEnabled());
        pref.setSystemEnabled(request.isSystemEnabled());
        pref.setPriceAlertEnabled(request.isPriceAlertEnabled());
        pref.setDividendAlertEnabled(request.isDividendAlertEnabled());
        pref.setDailySummaryEnabled(request.isDailySummaryEnabled());
        pref.setWeeklySummaryEnabled(request.isWeeklySummaryEnabled());
        pref.setMonthlySummaryEnabled(request.isMonthlySummaryEnabled());

        pref = notificationPreferenceRepository.save(pref);
        return mapToPreferenceResponse(pref);
    }

    private NotificationPreference createDefaultPreferences(User user) {
        NotificationPreference pref = NotificationPreference.builder().user(user).build();
        return notificationPreferenceRepository.save(pref);
    }

    private NotificationPreferenceResponse mapToPreferenceResponse(NotificationPreference pref) {
        return NotificationPreferenceResponse.builder()
                .id(pref.getId())
                .pushEnabled(pref.isPushEnabled())
                .financeEnabled(pref.isFinanceEnabled())
                .investmentEnabled(pref.isInvestmentEnabled())
                .newsEnabled(pref.isNewsEnabled())
                .aiEnabled(pref.isAiEnabled())
                .systemEnabled(pref.isSystemEnabled())
                .priceAlertEnabled(pref.isPriceAlertEnabled())
                .dividendAlertEnabled(pref.isDividendAlertEnabled())
                .dailySummaryEnabled(pref.isDailySummaryEnabled())
                .weeklySummaryEnabled(pref.isWeeklySummaryEnabled())
                .monthlySummaryEnabled(pref.isMonthlySummaryEnabled())
                .build();
    }

    @Transactional
    public void deleteAccount(String email, String password) {
        User user = getUserByEmail(email);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("Invalid password");
        }
        userRepository.delete(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User", email));
    }
    
    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User", id.toString()));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .premium(user.isPremium())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
