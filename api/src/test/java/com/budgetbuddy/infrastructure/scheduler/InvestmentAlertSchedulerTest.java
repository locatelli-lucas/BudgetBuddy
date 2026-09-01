package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.investment.Investment;
import com.budgetbuddy.domain.investment.InvestmentRepository;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.notification.Notification;
import com.budgetbuddy.domain.notification.NotificationService;
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
class InvestmentAlertSchedulerTest {

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private MarketService marketService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InvestmentAlertScheduler investmentAlertScheduler;

    private User user;
    private Investment investment;
    private QuoteResponse quote;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        investment = Investment.builder()
                .user(user)
                .ticker("PETR4.SA")
                .build();

        quote = new QuoteResponse();
        quote.setSymbol("PETR4.SA");
        quote.setPrice(new BigDecimal("35.00"));
        quote.setChangePercent(new BigDecimal("6.0")); // 6% variation
    }

    @Test
    @DisplayName("Should trigger notification when variation is >= 5%")
    void shouldTriggerNotification() {
        when(investmentRepository.findDistinctTickers()).thenReturn(List.of("PETR4.SA"));
        when(marketService.getQuoteFresh("PETR4.SA")).thenReturn(quote);
        when(investmentRepository.findByTicker("PETR4.SA")).thenReturn(List.of(investment));
        when(notificationService.hasRecentNotification(any(), any(), anyString(), anyInt())).thenReturn(false);

        investmentAlertScheduler.checkSignificantMovements();

        verify(notificationService).createAndSendNotification(
                eq(user),
                anyString(),
                anyString(),
                eq(Notification.NotificationType.ALERT),
                eq(Notification.NotificationCategory.INVESTMENTS),
                any(),
                contains("PETR4.SA"),
                anyMap()
        );
    }

    @Test
    @DisplayName("Should NOT trigger notification when variation is < 5%")
    void shouldNotTriggerNotificationWhenSmallVariation() {
        quote.setChangePercent(new BigDecimal("2.0"));
        when(investmentRepository.findDistinctTickers()).thenReturn(List.of("PETR4.SA"));
        when(marketService.getQuoteFresh("PETR4.SA")).thenReturn(quote);

        investmentAlertScheduler.checkSignificantMovements();

        verify(notificationService, never()).createAndSendNotification(any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should NOT trigger notification if already notified recently (idempotency)")
    void shouldNotTriggerIfAlreadyNotified() {
        when(investmentRepository.findDistinctTickers()).thenReturn(List.of("PETR4.SA"));
        when(marketService.getQuoteFresh("PETR4.SA")).thenReturn(quote);
        when(investmentRepository.findByTicker("PETR4.SA")).thenReturn(List.of(investment));
        // Simulate that a notification was already sent in the last hour
        when(notificationService.hasRecentNotification(eq(user), eq(Notification.NotificationCategory.INVESTMENTS), anyString(), eq(1)))
                .thenReturn(true);

        investmentAlertScheduler.checkSignificantMovements();

        verify(notificationService, never()).createAndSendNotification(any(), any(), any(), any(), any(), any(), any(), any());
    }
}
