package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.investment.Investment;
import com.budgetbuddy.domain.investment.InvestmentRepository;
import com.budgetbuddy.domain.market.dto.QuoteResponse;
import com.budgetbuddy.domain.market.service.MarketService;
import com.budgetbuddy.domain.notification.Notification;
import com.budgetbuddy.domain.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Runs every 5 minutes during market hours (Mon–Fri, 10:00–18:00 BRT).
 * Fetches fresh Yahoo Finance quotes for every ticker held by any user
 * and sends a push notification when intraday variation exceeds ±5%.
 *
 * Uses getQuoteFresh() so the cache is bypassed AND refreshed each cycle,
 * keeping REST-endpoint responses up-to-date without extra API calls.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InvestmentAlertScheduler {


    private final InvestmentRepository investmentRepository;
    private final MarketService marketService;
    private final NotificationService notificationService;

    private static final double MOVEMENT_THRESHOLD_PCT = 5.0;

    // Runs every 5 minutes, Mon–Fri, between 10:00 and 18:00 (market hours)
    @Scheduled(cron = "0 */5 10-18 * * MON-FRI")
    public void checkSignificantMovements() {
        log.info("InvestmentAlertScheduler: checking significant price movements...");

        List<String> tickers = investmentRepository.findDistinctTickers();
        if (tickers.isEmpty()) {
            log.debug("InvestmentAlertScheduler: no tracked tickers, skipping.");
            return;
        }

        for (String ticker : tickers) {
            try {
                // Always fetch fresh data — also updates Redis cache for REST endpoints
                QuoteResponse quote = marketService.getQuoteFresh(ticker);
                if (quote == null || quote.getChangePercent() == null) continue;

                double changePct = quote.getChangePercent().doubleValue();
                if (Math.abs(changePct) < MOVEMENT_THRESHOLD_PCT) continue;

                // Find all users holding this ticker
                List<Investment> holders = investmentRepository.findByTicker(ticker);
                // Deduplicate by user
                Set<UUID> notifiedUsers = new HashSet<>();

                for (Investment inv : holders) {
                    if (!notifiedUsers.add(inv.getUser().getId())) continue;

                    String direction = changePct > 0 ? "subiu" : "caiu";
                    String arrow     = changePct > 0 ? "📈" : "📉";
                    java.util.Locale ptBR = new java.util.Locale("pt", "BR");
                    String title     = String.format(ptBR, "%s %s %,.1f%% hoje", ticker, arrow, Math.abs(changePct));
                    String message   = String.format(ptBR,
                            "%s %s %,.2f%% no pregão de hoje. Cotação atual: R$ %,.2f.",
                            ticker, direction, Math.abs(changePct), quote.getPrice()
                    );

                    notificationService.createAndSendNotification(
                            inv.getUser(),
                            title,
                            message,
                            Notification.NotificationType.ALERT,
                            Notification.NotificationCategory.INVESTMENTS,
                            Math.abs(changePct) >= 10.0
                                    ? Notification.NotificationPriority.HIGH
                                    : Notification.NotificationPriority.MEDIUM,
                            "/investments/" + ticker,
                            Map.of(
                                    "ticker", ticker,
                                    "changePercent", String.format("%.2f", changePct),
                                    "price", String.format("%.2f", quote.getPrice())
                            )
                    );
                }

                log.info("InvestmentAlertScheduler: {} moved {}%, notified {} holder(s)",
                        ticker, String.format("%.1f", changePct), notifiedUsers.size());

            } catch (Exception e) {
                log.error("InvestmentAlertScheduler: error processing ticker {}", ticker, e);
            }
        }
    }
}
