package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled = true;

    @Builder.Default
    @Column(name = "finance_enabled", nullable = false)
    private boolean financeEnabled = true;

    @Builder.Default
    @Column(name = "investment_enabled", nullable = false)
    private boolean investmentEnabled = true;

    @Builder.Default
    @Column(name = "news_enabled", nullable = false)
    private boolean newsEnabled = true;

    @Builder.Default
    @Column(name = "ai_enabled", nullable = false)
    private boolean aiEnabled = true;

    @Builder.Default
    @Column(name = "system_enabled", nullable = false)
    private boolean systemEnabled = true;

    @Builder.Default
    @Column(name = "price_alert_enabled", nullable = false)
    private boolean priceAlertEnabled = true;

    @Builder.Default
    @Column(name = "dividend_alert_enabled", nullable = false)
    private boolean dividendAlertEnabled = true;

    @Builder.Default
    @Column(name = "daily_summary_enabled", nullable = false)
    private boolean dailySummaryEnabled = true;

    @Builder.Default
    @Column(name = "weekly_summary_enabled", nullable = false)
    private boolean weeklySummaryEnabled = true;

    @Builder.Default
    @Column(name = "monthly_summary_enabled", nullable = false)
    private boolean monthlySummaryEnabled = true;
}
