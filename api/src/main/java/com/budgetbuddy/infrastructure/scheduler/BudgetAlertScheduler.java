package com.budgetbuddy.infrastructure.scheduler;

import com.budgetbuddy.domain.budget.BudgetService;
import com.budgetbuddy.domain.notification.NotificationService;
import com.budgetbuddy.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BudgetAlertScheduler {

    private final BudgetService budgetService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Runs every day at 10 AM
    @Scheduled(cron = "0 0 10 * * ?")
    public void checkBudgetLimits() {
        log.info("Running scheduled BudgetAlertScheduler");
        
        // In Phase 6: Iterate through active budgets, check spent %
        // If > 80% and no warning notification sent this month, send WARNING
        // If > 100% and no exceeded notification sent this month, send EXCEEDED
    }
}
