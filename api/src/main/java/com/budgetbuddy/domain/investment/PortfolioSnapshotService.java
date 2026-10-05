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

        // Backfill historical snapshots for all unique purchase dates
        backfillHistoricalSnapshots(user, investments);
    }

    private void backfillHistoricalSnapshots(User user, List<Investment> investments) {
        List<LocalDate> purchaseDates = investments.stream()
                .map(Investment::getPurchaseDate)
                .distinct()
                .filter(date -> date.isBefore(LocalDate.now()))
                .sorted()
                .toList();

        for (LocalDate date : purchaseDates) {
            if (!snapshotRepository.existsByUserIdAndSnapshotDate(user.getId(), date)) {
                // Calculate value on that date: sum of (qty * avgPrice) for investments on or before that date
                BigDecimal valueAtDate = investments.stream()
                        .filter(i -> !i.getPurchaseDate().isAfter(date))
                        .map(i -> i.getAvgPrice().multiply(i.getQuantity()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                PortfolioSnapshot snapshot = PortfolioSnapshot.builder()
                        .user(user)
                        .portfolioValue(valueAtDate)
                        .investedAmount(valueAtDate)
                        .profitLoss(BigDecimal.ZERO)
                        .profitLossPercentage(BigDecimal.ZERO)
                        .snapshotDate(date)
                        .build();

                snapshotRepository.save(snapshot);
                log.info("Backfilled snapshot for user {} on {}", user.getId(), date);
            }
        }
    }

    /**
     * Returns portfolio performance history from snapshots for a given period.
     * Fills missing dates continuously using baseline snapshot value carrying forward.
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

        List<PortfolioSnapshot> rawSnapshots = snapshotRepository
                .findByUserIdAndSnapshotDateBetweenOrderBySnapshotDateAsc(userId, start, end);

        java.util.Map<LocalDate, PortfolioSnapshot> snapshotMap = rawSnapshots.stream()
                .collect(java.util.stream.Collectors.toMap(PortfolioSnapshot::getSnapshotDate, s -> s, (s1, s2) -> s1));

        // Determine initial value at start
        BigDecimal lastKnownValue;
        List<PortfolioSnapshot> beforeList = snapshotRepository.findBeforeDate(userId, start);
        if (!beforeList.isEmpty()) {
            lastKnownValue = beforeList.get(0).getPortfolioValue();
        } else if (!rawSnapshots.isEmpty()) {
            lastKnownValue = rawSnapshots.get(0).getPortfolioValue();
        } else {
            // Calculate value at start date from investments
            List<Investment> investments = investmentRepository.findByUserId(userId);
            lastKnownValue = investments.stream()
                    .filter(i -> i.getPurchaseDate() != null && !i.getPurchaseDate().isAfter(start))
                    .map(i -> i.getAvgPrice().multiply(i.getQuantity()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        // If user has no investments or snapshots at all
        if (lastKnownValue.compareTo(BigDecimal.ZERO) == 0 && rawSnapshots.isEmpty()) {
            List<Investment> investments = investmentRepository.findByUserId(userId);
            if (investments.isEmpty()) {
                return List.of();
            }
        }

        List<PortfolioSnapshot> result = new java.util.ArrayList<>();
        LocalDate current = start;

        while (!current.isAfter(end)) {
            if (snapshotMap.containsKey(current)) {
                PortfolioSnapshot existing = snapshotMap.get(current);
                if (existing != null && existing.getPortfolioValue() != null) {
                    lastKnownValue = existing.getPortfolioValue();
                }
                result.add(existing);
            } else {
                result.add(PortfolioSnapshot.builder()
                        .portfolioValue(lastKnownValue)
                        .snapshotDate(current)
                        .build());
            }
            current = current.plusDays(1);
        }

        return result;
    }
}
