package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PortfolioSnapshotServiceTest {

    @Mock
    private PortfolioSnapshotRepository snapshotRepository;

    @Mock
    private InvestmentRepository investmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MarketService marketService;

    @InjectMocks
    private PortfolioSnapshotService snapshotService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("test@example.com")
                .build();
    }

    @Test
    @DisplayName("Should return empty list when user has no snapshots and no investments")
    void shouldReturnEmptyWhenNoData() {
        when(snapshotRepository.findByUserIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(any(), any(), any()))
                .thenReturn(List.of());
        when(snapshotRepository.findBeforeDate(any(), any()))
                .thenReturn(List.of());
        when(investmentRepository.findByUserId(userId))
                .thenReturn(List.of());

        List<PortfolioSnapshot> result = snapshotService.getPerformance(userId, "1M");
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should fill continuous timeline using baseline snapshot prior to start date")
    void shouldFillContinuousTimelineWithBaseline() {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusMonths(1);

        // Baseline snapshot from 2 months ago
        PortfolioSnapshot baseline = PortfolioSnapshot.builder()
                .user(user)
                .portfolioValue(new BigDecimal("10000.00"))
                .snapshotDate(today.minusMonths(2))
                .build();

        // One snapshot today
        PortfolioSnapshot todaySnapshot = PortfolioSnapshot.builder()
                .user(user)
                .portfolioValue(new BigDecimal("12000.00"))
                .snapshotDate(today)
                .build();

        when(snapshotRepository.findByUserIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(eq(userId), eq(start), eq(today)))
                .thenReturn(List.of(todaySnapshot));
        when(snapshotRepository.findBeforeDate(eq(userId), eq(start)))
                .thenReturn(List.of(baseline));

        List<PortfolioSnapshot> result = snapshotService.getPerformance(userId, "1M");

        assertFalse(result.isEmpty());
        // Should have a point for every day in the month
        assertEquals(start, result.get(0).getSnapshotDate());
        assertEquals(today, result.get(result.size() - 1).getSnapshotDate());
        assertEquals(new BigDecimal("10000.00"), result.get(0).getPortfolioValue());
        assertEquals(new BigDecimal("12000.00"), result.get(result.size() - 1).getPortfolioValue());
    }
}
