package com.budgetbuddy.domain.user;

import com.budgetbuddy.shared.security.EncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TwoFactorServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserSecurityRepository userSecurityRepository;
    @Mock
    private EncryptionService encryptionService;
    @Mock
    private PasswordEncoder passwordEncoder;

    private TwoFactorService twoFactorService;

    @BeforeEach
    void setUp() {
        twoFactorService = new TwoFactorService(userRepository, userSecurityRepository, encryptionService, passwordEncoder);
    }

    @Test
    void setupTwoFactor_ShouldReturnSecretAndQrCode() {
        User user = User.builder().email("test@example.com").build();
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userSecurityRepository.findByUserId(any())).thenReturn(Optional.empty());
        when(encryptionService.encrypt(anyString())).thenReturn("encryptedSecret");

        Map<String, String> result = twoFactorService.setupTwoFactor("test@example.com");

        assertNotNull(result.get("secret"));
        assertNotNull(result.get("qrCode"));
        verify(userSecurityRepository).save(any(UserSecurity.class));
    }

    @Test
    void verifyTotp_ShouldReturnTrueForValidBackupCode() {
        UserSecurity security = UserSecurity.builder()
                .twoFactorEnabled(true)
                .backupCodes("hashedCode1,hashedCode2")
                .build();
        
        when(userSecurityRepository.findByUserEmail("test@example.com")).thenReturn(Optional.of(security));
        when(encryptionService.decrypt(any())).thenReturn("JBSWY3DPEHPK3PXP"); // Dummy secret
        when(passwordEncoder.matches("BACKUP1", "hashedCode1")).thenReturn(true);

        boolean result = twoFactorService.verifyTotp("test@example.com", "BACKUP1");

        assertTrue(result);
        verify(userSecurityRepository).save(any(UserSecurity.class));
        assertFalse(security.getBackupCodes().contains("hashedCode1"));
    }
}
