package com.budgetbuddy.domain.auth;

import com.budgetbuddy.domain.auth.dto.LoginRequest;
import com.budgetbuddy.domain.auth.dto.LoginResponse;
import com.budgetbuddy.domain.auth.dto.RefreshRequest;
import com.budgetbuddy.domain.auth.dto.RegisterRequest;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import com.budgetbuddy.domain.user.dto.UserResponse;
import com.budgetbuddy.shared.exception.BusinessException;
import com.budgetbuddy.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.refresh-expiry-ms}")
    private long refreshTokenDurationMs;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        user = userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        String refreshTokenStr = UUID.randomUUID().toString();
        
        saveUserRefreshToken(user, refreshTokenStr);

        return LoginResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshTokenStr)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(); // Should not happen as auth manager succeeded

        String jwtToken = jwtService.generateToken(user);
        
        // Revoke all existing refresh tokens
        revokeAllUserTokens(user.getId());
        
        String refreshTokenStr = UUID.randomUUID().toString();
        saveUserRefreshToken(user, refreshTokenStr);

        return LoginResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshTokenStr)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Refresh token not found"));

        if (refreshToken.isRevoked() || refreshToken.isExpired()) {
            throw new BusinessException("Refresh token is invalid or expired");
        }

        User user = refreshToken.getUser();
        String jwtToken = jwtService.generateToken(user);

        // Rotate the refresh token
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        
        String newRefreshTokenStr = UUID.randomUUID().toString();
        saveUserRefreshToken(user, newRefreshTokenStr);

        return LoginResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(newRefreshTokenStr)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Refresh token not found"));
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    private void saveUserRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenDurationMs * 1000000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
    }

    private void revokeAllUserTokens(UUID userId) {
        refreshTokenRepository.revokeAllUserTokens(userId);
    }

    private UserResponse mapToUserResponse(User user) {
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
