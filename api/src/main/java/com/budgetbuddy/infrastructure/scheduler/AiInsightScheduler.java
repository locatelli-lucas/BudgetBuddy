package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.insight.AiInsightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiInsightScheduler {

    private final AiInsightService aiInsightService;

    // Runs every Monday at 7 AM
    @Scheduled(cron = "0 0 7 * * MON")
    public void generateWeeklyInsights() {
        log.info("Running scheduled AiInsightScheduler");
        
        // In Phase 6: Iterate through users, analyze past week data,
        // call AiProvider to generate personalized insights,
        // save insights to DB and send FCM push notification
    }
}
