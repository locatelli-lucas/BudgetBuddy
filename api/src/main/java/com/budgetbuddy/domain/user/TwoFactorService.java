package com.budgetbuddy.domain.user;

import com.budgetbuddy.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Map<String, String> setupTwoFactor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.isTwoFactorEnabled()) {
            throw new BusinessException("2FA is already enabled. Disable it first to regenerate.");
        }

        byte[] secretBytes = new byte[20];
        new SecureRandom().nextBytes(secretBytes);
        String secret = Base64.getEncoder().encodeToString(secretBytes);

        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        String qrCodeUrl = generateQrCodeUrl(user.getEmail(), secret);
        return Map.of("secret", secret, "qrCodeUrl", qrCodeUrl);
    }

    @Transactional
    public void enableTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (user.getTwoFactorSecret() == null) {
            throw new BusinessException("2FA setup not initiated. Call /setup first.");
        }

        if (!verifyTotp(user.getTwoFactorSecret(), code)) {
            throw new BusinessException("Invalid verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disableTwoFactor(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!user.isTwoFactorEnabled()) {
            throw new BusinessException("2FA is not enabled");
        }

        if (!verifyTotp(user.getTwoFactorSecret(), code)) {
            throw new BusinessException("Invalid verification code");
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    public boolean verifyTotp(String secret, String code) {
        try {
            long currentTimeSeconds = System.currentTimeMillis() / 1000;
            // Allow 30-second window with 1 step tolerance (check current and previous)
            return checkCode(secret, code, currentTimeSeconds / 30)
                    || checkCode(secret, code, (currentTimeSeconds / 30) - 1)
                    || checkCode(secret, code, (currentTimeSeconds / 30) + 1);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean checkCode(String secret, String code, long counter) throws Exception {
        byte[] key = Base64.getDecoder().decode(secret);
        byte[] data = new byte[8];
        long value = counter;
        for (int i = 8; i-- > 0; value >>>= 8) {
            data[i] = (byte) value;
        }

        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(key, "HmacSHA1"));
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0xF;
        long truncatedHash = 0;
        for (int i = 0; i < 4; ++i) {
            truncatedHash <<= 8;
            truncatedHash |= (hash[offset + i] & 0xFF);
        }
        truncatedHash &= 0x7FFFFFFF;
        truncatedHash %= 1_000_000;

        String expectedCode = String.format("%06d", truncatedHash);
        return expectedCode.equals(code);
    }

    private String generateQrCodeUrl(String email, String secret) {
        String encodedIssuer = URLEncoder.encode("BudgetBuddy", StandardCharsets.UTF_8);
        String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String otpAuthUrl = String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s",
                encodedIssuer, encodedEmail, secret, encodedIssuer);
        return String.format(
                "https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=%s",
                URLEncoder.encode(otpAuthUrl, StandardCharsets.UTF_8));
    }
}
