package com.budgetbuddy.domain.user;

import com.budgetbuddy.shared.exception.BusinessException;
import com.budgetbuddy.shared.security.EncryptionService;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

import static dev.samstevens.totp.util.Utils.getDataUriForImage;

@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final UserRepository userRepository;
    private final UserSecurityRepository userSecurityRepository;
    private final EncryptionService encryptionService;
    private final PasswordEncoder passwordEncoder;

    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final QrGenerator qrGenerator = new ZxingPngQrGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), timeProvider);

    @Transactional
    public Map<String, String> setupTwoFactor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        UserSecurity security = userSecurityRepository.findByUserId(user.getId())
                .orElseGet(() -> UserSecurity.builder().user(user).build());

        if (security.isTwoFactorEnabled()) {
            throw new BusinessException("2FA is already enabled. Disable it first to regenerate.");
        }

        String secret = secretGenerator.generate();
        security.setTotpSecret(encryptionService.encrypt(secret));
        userSecurityRepository.save(security);

        QrData data = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("BudgetBuddy")
                .build();

        try {
            byte[] imageData = qrGenerator.generate(data);
            String qrCodeBase64 = getDataUriForImage(imageData, qrGenerator.getImageMimeType());
            return Map.of("secret", secret, "qrCode", qrCodeBase64);
        } catch (Exception e) {
            throw new BusinessException("Failed to generate QR code");
        }
    }

    @Transactional
    public List<String> enableTwoFactor(String email, String code) {
        UserSecurity security = userSecurityRepository.findByUserEmail(email)
                .orElseThrow(() -> new BusinessException("2FA setup not initiated"));

        if (security.getTotpSecret() == null) {
            throw new BusinessException("2FA setup not initiated. Call /setup first.");
        }

        String secret = encryptionService.decrypt(security.getTotpSecret());

        if (!codeVerifier.isValidCode(secret, code)) {
            throw new BusinessException("Invalid verification code");
        }

        List<String> backupCodes = generateBackupCodes();
        security.setBackupCodes(backupCodes.stream()
                .map(passwordEncoder::encode)
                .collect(Collectors.joining(",")));
        security.setTwoFactorEnabled(true);
        userSecurityRepository.save(security);

        return backupCodes;
    }

    @Transactional
    public void disableTwoFactor(String email, String code) {
        UserSecurity security = userSecurityRepository.findByUserEmail(email)
                .orElseThrow(() -> new BusinessException("User security not found"));

        if (!security.isTwoFactorEnabled()) {
            throw new BusinessException("2FA is not enabled");
        }

        String secret = encryptionService.decrypt(security.getTotpSecret());

        if (!codeVerifier.isValidCode(secret, code)) {
            throw new BusinessException("Invalid verification code");
        }

        security.setTwoFactorEnabled(false);
        security.setTotpSecret(null);
        security.setBackupCodes(null);
        userSecurityRepository.save(security);
    }

    public boolean verifyTotp(String email, String code) {
        return userSecurityRepository.findByUserEmail(email)
                .map(security -> {
                    if (!security.isTwoFactorEnabled()) return false;
                    
                    // Check TOTP
                    String secret = encryptionService.decrypt(security.getTotpSecret());
                    if (codeVerifier.isValidCode(secret, code)) {
                        return true;
                    }

                    // Check Backup Codes
                    if (security.getBackupCodes() != null) {
                        List<String> hashedCodes = new ArrayList<>(Arrays.asList(security.getBackupCodes().split(",")));
                        for (int i = 0; i < hashedCodes.size(); i++) {
                            if (passwordEncoder.matches(code, hashedCodes.get(i))) {
                                hashedCodes.remove(i);
                                security.setBackupCodes(String.join(",", hashedCodes));
                                userSecurityRepository.save(security);
                                return true;
                            }
                        }
                    }
                    return false;
                }).orElse(false);
    }

    private List<String> generateBackupCodes() {
        List<String> codes = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < 8; j++) {
                sb.append(Integer.toHexString(random.nextInt(16)).toUpperCase());
            }
            codes.add(sb.toString());
        }
        return codes;
    }
}
