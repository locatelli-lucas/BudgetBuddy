package com.budgetbuddy.domain.auth;

import com.budgetbuddy.domain.auth.dto.GoogleLoginRequest;
import com.budgetbuddy.domain.auth.dto.LoginResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import com.budgetbuddy.domain.user.UserSecurityRepository;
import com.budgetbuddy.shared.security.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceGoogleTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private SocialProviderRepository socialProviderRepository;
    @Mock
    private UserSecurityRepository userSecurityRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private GoogleAuthService googleAuthService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        // Since we are using @InjectMocks, manual instantiation might not be needed 
        // if all mocks are properly injected.
    }

    @Test
    void googleLogin_NewUser_ShouldCreateUserAndProvider() {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("new@gmail.com");
        payload.setSubject("google-id-123");
        payload.set("name", "New User");

        when(googleAuthService.verifyToken("valid-token")).thenReturn(payload);
        when(userRepository.findByEmail("new@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(socialProviderRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google-id-123")).thenReturn(Optional.empty());
        when(socialProviderRepository.save(any(SocialProvider.class))).thenAnswer(i -> i.getArguments()[0]);
        when(jwtService.generateToken(any())).thenReturn("jwt-token");
        when(userSecurityRepository.findByUserId(any())).thenReturn(Optional.empty());

        GoogleLoginRequest request = new GoogleLoginRequest("valid-token");
        LoginResponse response = authService.googleLogin(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getAccessToken());
        verify(userRepository).save(any(User.class));
        verify(socialProviderRepository).save(any(SocialProvider.class));
    }

    @Test
    void googleLogin_ExistingUser_ShouldLinkProviderIfNotExists() {
        User existingUser = User.builder().id(UUID.randomUUID()).email("existing@gmail.com").build();
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("existing@gmail.com");
        payload.setSubject("google-id-456");

        when(googleAuthService.verifyToken("valid-token")).thenReturn(payload);
        when(userRepository.findByEmail("existing@gmail.com")).thenReturn(Optional.of(existingUser));
        when(socialProviderRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, "google-id-456")).thenReturn(Optional.empty());
        when(socialProviderRepository.save(any(SocialProvider.class))).thenAnswer(i -> i.getArguments()[0]);
        when(jwtService.generateToken(any())).thenReturn("jwt-token");
        when(userSecurityRepository.findByUserId(any())).thenReturn(Optional.empty());

        GoogleLoginRequest request = new GoogleLoginRequest("valid-token");
        authService.googleLogin(request);

        verify(socialProviderRepository).save(any(SocialProvider.class));
        verify(userRepository, never()).save(any(User.class));
    }
}
