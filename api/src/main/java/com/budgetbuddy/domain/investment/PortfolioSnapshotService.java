package com.budgetbuddy.domain.investment;

import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.user.User;
import com.budgetbuddy.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioSnapshotService {

    private final PortfolioSnapshotRepository snapshotRepository;
    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;
    private final MarketService marketService;

    /**
     * Daily scheduled job — runs at 20:00 BRT (23:00 UTC) after markets close.
     * Creates a snapshot for every user who has investments.
     */
    @Scheduled(cron = "0 0 23 * * *", zone = "UTC")
    @Transactional
    public void generateDailySnapshots() {
        log.info("Starting daily portfolio snapshot generation");
        List<User> users = userRepository.findAll();
        int count = 0;
        for (User user : users) {
            try {
                generateSnapshotForUser(user);
                count++;
            } catch (Exception e) {
                log.error("Failed to generate snapshot for user {}", user.getId(), e);
            }
        }
        log.info("Daily portfolio snapshots generated for {} users", count);
    }

    @Transactional
    public void generateSnapshotForUser(User user) {
        LocalDate today = LocalDate.now();

        // Skip if snapshot already exists for today
        if (snapshotRepository.existsByUserIdAndSnapshotDate(user.getId(), today)) {
            return;
        }

        List<Investment> investments = investmentRepository.findByUserId(user.getId());
        if (investments.isEmpty()) return;

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal totalCurrentValue = BigDecimal.ZERO;

        for (Investment inv : investments) {
            BigDecimal invested = inv.getAvgPrice().multiply(inv.getQuantity());
            totalInvested = totalInvested.add(invested);

            // Try to get current market price, fall back to avgPrice
            BigDecimal currentPrice;
            try {
                QuoteResponse quote = marketService.getQuote(inv.getTicker());
                currentPrice = quote.getPrice();
            } catch (Exception e) {
                log.warn("Market data unavailable for {}, using avgPrice", inv.getTicker());
                currentPrice = inv.getAvgPrice();
            }
            totalCurrentValue = totalCurrentValue.add(currentPrice.multiply(inv.getQuantity()));
        }

        BigDecimal profitLoss = totalCurrentValue.subtract(totalInvested);
        BigDecimal profitLossPercent = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            profitLossPercent = profitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        PortfolioSnapshot snapshot = PortfolioSnapshot.builder()
                .user(user)
                .portfolioValue(totalCurrentValue)
                .investedAmount(totalInvested)
                .profitLoss(profitLoss)
                .profitLossPercentage(profitLossPercent)
                .snapshotDate(today)
                .build();

        snapshotRepository.save(snapshot);
        log.debug("Snapshot created for user {}: value={}, P&L={}", user.getId(), totalCurrentValue, profitLoss);
    }

    /**
     * Returns portfolio performance history from snapshots for a given period.
     */
    @Transactional(readOnly = true)
    public List<PortfolioSnapshot> getPerformance(UUID userId, String period) {
        LocalDate end = LocalDate.now();
        LocalDate start = switch (period.toUpperCase()) {
            case "1M" -> end.minusMonths(1);
            case "3M" -> end.minusMonths(3);
            case "6M" -> end.minusMonths(6);
            case "1Y" -> end.minusYears(1);
            case "ALL", "5Y" -> end.minusYears(5);
            default -> end.minusMonths(1);
        };

        return snapshotRepository.findByUserIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(
                userId, start, end);
    }
}
