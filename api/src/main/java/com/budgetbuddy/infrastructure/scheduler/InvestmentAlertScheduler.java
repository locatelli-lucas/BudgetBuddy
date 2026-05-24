package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.investment.InvestmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvestmentAlertScheduler {

    private final InvestmentService investmentService;

    // Runs every weekday at 17:30 (market close)
    @Scheduled(cron = "0 30 17 * * MON-FRI")
    public void checkInvestmentAlerts() {
        log.info("Running scheduled InvestmentAlertScheduler");
        
        // In Phase 6: Fetch closing prices for all tickers owned by users
        // If daily change > threshold (e.g. 5%), send alert notification
    }
}
