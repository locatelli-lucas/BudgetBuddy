package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.notification.dto.PriceAlertRequest;
import com.budgetbuddy.domain.notification.dto.PriceAlertResponse;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserService;
import com.budgetbuddy.shared.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceAlertService {

    private final PriceAlertRepository priceAlertRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> getPriceAlerts(String email) {
        User user = userService.getUserByEmail(email);
        return priceAlertRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public PriceAlertResponse createPriceAlert(String email, PriceAlertRequest request) {
        User user = userService.getUserByEmail(email);
        PriceAlert alert = PriceAlert.builder()
                .user(user)
                .symbol(request.getSymbol())
                .condition(request.getCondition())
                .targetPrice(request.getTargetPrice())
                .build();
        return mapToResponse(priceAlertRepository.save(alert));
    }

    @Transactional
    public void deletePriceAlert(String email, UUID id) {
        User user = userService.getUserByEmail(email);
        PriceAlert alert = priceAlertRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new EntityNotFoundException("PriceAlert", id.toString()));
        priceAlertRepository.delete(alert);
    }

    @Transactional
    public void markAsTriggered(PriceAlert alert) {
        alert.setActive(false);
        alert.setTriggeredAt(LocalDateTime.now());
        priceAlertRepository.save(alert);
    }

    @Transactional(readOnly = true)
    public List<PriceAlert> getActivePriceAlerts() {
        return priceAlertRepository.findByIsActiveTrue();
    }

    private PriceAlertResponse mapToResponse(PriceAlert alert) {
        return PriceAlertResponse.builder()
                .id(alert.getId())
                .symbol(alert.getSymbol())
                .condition(alert.getCondition())
                .targetPrice(alert.getTargetPrice())
                .isActive(alert.isActive())
                .createdAt(alert.getCreatedAt())
                .triggeredAt(alert.getTriggeredAt())
                .build();
    }
}
