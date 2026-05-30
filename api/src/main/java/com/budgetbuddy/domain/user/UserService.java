package com.budgetbuddy.domain.user;

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

    @Transactional(readOnly = true)
    public UserResponse getUserProfile(String email) {
        User user = getUserByEmail(email);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateUserRequest request) {
        User user = getUserByEmail(email);
        user.setName(request.getName());
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

    @Transactional
    public void deleteAccount(String email) {
        User user = getUserByEmail(email);
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
