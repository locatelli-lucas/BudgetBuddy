package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.notification.Notification;
import com.budgetbuddy.domain.notification.NotificationService;
import com.budgetbuddy.domain.notification.PriceAlert;
import com.budgetbuddy.domain.notification.PriceAlertService;
import com.budgetbuddy.domain.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PriceMonitoringSchedulerTest {

    @Mock
    private PriceAlertService priceAlertService;

    @Mock
    private MarketService marketService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PriceMonitoringScheduler priceMonitoringScheduler;

    private User user;
    private PriceAlert alert;
    private QuoteResponse quote;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        alert = PriceAlert.builder()
                .id(UUID.randomUUID())
                .user(user)
                .symbol("AAPL")
                .condition(PriceAlert.AlertCondition.ABOVE)
                .targetPrice(new BigDecimal("150.00"))
                .isActive(true)
                .build();

        quote = new QuoteResponse();
        quote.setSymbol("AAPL");
        quote.setPrice(new BigDecimal("155.00"));
    }

    @Test
    @DisplayName("Should trigger alert when condition ABOVE is met")
    void shouldTriggerAboveAlert() {
        when(priceAlertService.getActivePriceAlerts()).thenReturn(List.of(alert));
        when(marketService.getQuoteFresh("AAPL")).thenReturn(quote);

        priceMonitoringScheduler.monitorPrices();

        verify(notificationService).createAndSendNotification(
                eq(user),
                contains("Alerta de Preço"),
                contains("AAPL"),
                eq(Notification.NotificationType.ALERT),
                eq(Notification.NotificationCategory.INVESTMENTS),
                eq(Notification.NotificationPriority.HIGH),
                anyString(),
                isNull()
        );
        verify(priceAlertService).markAsTriggered(alert);
    }

    @Test
    @DisplayName("Should trigger alert when condition BELOW is met")
    void shouldTriggerBelowAlert() {
        alert.setCondition(PriceAlert.AlertCondition.BELOW);
        alert.setTargetPrice(new BigDecimal("160.00"));
        
        when(priceAlertService.getActivePriceAlerts()).thenReturn(List.of(alert));
        when(marketService.getQuoteFresh("AAPL")).thenReturn(quote);

        priceMonitoringScheduler.monitorPrices();

        verify(notificationService).createAndSendNotification(
                eq(user),
                anyString(),
                anyString(),
                eq(Notification.NotificationType.ALERT),
                eq(Notification.NotificationCategory.INVESTMENTS),
                eq(Notification.NotificationPriority.HIGH),
                anyString(),
                isNull()
        );
        verify(priceAlertService).markAsTriggered(alert);
    }

    @Test
    @DisplayName("Should NOT trigger alert if condition is not met")
    void shouldNotTriggerIfConditionNotMet() {
        quote.setPrice(new BigDecimal("145.00"));
        when(priceAlertService.getActivePriceAlerts()).thenReturn(List.of(alert));
        when(marketService.getQuoteFresh("AAPL")).thenReturn(quote);

        priceMonitoringScheduler.monitorPrices();

        verify(notificationService, never()).createAndSendNotification(any(), any(), any(), any(), any(), any(), any(), any());
        verify(priceAlertService, never()).markAsTriggered(any());
    }
}
