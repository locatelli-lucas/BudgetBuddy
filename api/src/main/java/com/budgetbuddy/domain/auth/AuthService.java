package com.budgetbuddy.domain.auth;

import com.budgetbuddy.domain.auth.dto.GoogleLoginRequest;
import com.budgetbuddy.domain.auth.dto.LoginRequest;
import com.budgetbuddy.domain.auth.dto.LoginResponse;
import com.budgetbuddy.domain.auth.dto.RefreshRequest;
import com.budgetbuddy.domain.auth.dto.RegisterRequest;
import com.budgetbuddy.domain.auth.dto.TwoFactorLoginRequest;
import com.budgetbuddy.domain.user.TwoFactorService;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import com.budgetbuddy.domain.user.UserSecurity;
import com.budgetbuddy.domain.user.UserSecurityRepository;
import com.budgetbuddy.domain.user.dto.UserResponse;
import com.budgetbuddy.shared.exception.BusinessException;
import com.budgetbuddy.shared.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserSecurityRepository userSecurityRepository;
    private final SocialProviderRepository socialProviderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TwoFactorService twoFactorService;
    private final GoogleAuthService googleAuthService;

    @Value("${jwt.refresh-expiry-ms}")
    private long refreshTokenDurationMs;

    // Temporary storage for 2FA tokens. In production, use Redis.
    private final Map<String, String> temporaryTokens = new ConcurrentHashMap<>();

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        return generateLoginResponse(user);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        return handlePossible2FA(user);
    }

    @Transactional
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleAuthService.verifyToken(request.getIdToken());
        String email = payload.getEmail();
        String googleId = payload.getSubject();

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .name((String) payload.get("name"))
                    .email(email)
                    .avatarUrl((String) payload.get("picture"))
                    .emailVerified(true)
                    .build();
            return userRepository.save(newUser);
        });

        // Ensure SocialProvider is linked
        socialProviderRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, googleId)
                .orElseGet(() -> {
                    SocialProvider provider = SocialProvider.builder()
                            .user(user)
                            .provider(AuthProvider.GOOGLE)
                            .providerId(googleId)
                            .providerEmail(email)
                            .providerPicture((String) payload.get("picture"))
                            .build();
                    return socialProviderRepository.save(provider);
                });

        return handlePossible2FA(user);
    }

    @Transactional
    public void linkGoogle(String email, GoogleLoginRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        GoogleIdToken.Payload payload = googleAuthService.verifyToken(request.getIdToken());
        String googleId = payload.getSubject();

        socialProviderRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, googleId)
                .ifPresent(p -> {
                    if (!p.getUser().getId().equals(user.getId())) {
                        throw new BusinessException("This Google account is already linked to another user");
                    }
                });

        socialProviderRepository.findByUserIdAndProvider(user.getId(), AuthProvider.GOOGLE)
                .orElseGet(() -> {
                    SocialProvider provider = SocialProvider.builder()
                            .user(user)
                            .provider(AuthProvider.GOOGLE)
                            .providerId(googleId)
                            .providerEmail(payload.getEmail())
                            .providerPicture((String) payload.get("picture"))
                            .build();
                    return socialProviderRepository.save(provider);
                });
    }

    @Transactional
    public void unlinkGoogle(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        // Check if user has another way to login
        boolean hasPassword = user.getPassword() != null;
        List<SocialProvider> providers = socialProviderRepository.findByUserId(user.getId());
        
        if (!hasPassword && providers.size() <= 1) {
            throw new BusinessException("Cannot unlink the only authentication method");
        }

        socialProviderRepository.deleteByUserIdAndProvider(user.getId(), AuthProvider.GOOGLE);
    }

    public List<AuthProvider> getConnectedProviders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        List<AuthProvider> providers = new java.util.ArrayList<>();
        if (user.getPassword() != null) {
            providers.add(AuthProvider.EMAIL);
        }
        socialProviderRepository.findByUserId(user.getId())
                .forEach(p -> providers.add(p.getProvider()));
        
        return providers;
    }

    private LoginResponse handlePossible2FA(User user) {
        UserSecurity security = userSecurityRepository.findByUserId(user.getId()).orElse(null);

        if (security != null && security.isTwoFactorEnabled()) {
            String tempToken = UUID.randomUUID().toString();
            temporaryTokens.put(tempToken, user.getEmail());
            return LoginResponse.builder()
                    .requires2FA(true)
                    .temporaryToken(tempToken)
                    .build();
        }

        return generateLoginResponse(user);
    }

    @Transactional
    public LoginResponse verify2fa(TwoFactorLoginRequest request) {
        String email = temporaryTokens.get(request.getTemporaryToken());
        if (email == null) {
            throw new BusinessException("Invalid or expired temporary token");
        }

        if (!twoFactorService.verifyTotp(email, request.getCode())) {
            throw new BusinessException("Invalid 2FA code");
        }

        temporaryTokens.remove(request.getTemporaryToken());
        User user = userRepository.findByEmail(email).orElseThrow();
        
        return generateLoginResponse(user);
    }

    private LoginResponse generateLoginResponse(User user) {
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
