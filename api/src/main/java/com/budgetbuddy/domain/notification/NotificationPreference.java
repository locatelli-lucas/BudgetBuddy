package com.budgetbuddy.domain.notification;

import com.budgetbuddy.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @Column(name = "budget_alerts", nullable = false)
    private boolean budgetAlerts = true;

    @Builder.Default
    @Column(name = "unusual_spending_alerts", nullable = false)
    private boolean unusualSpendingAlerts = true;

    @Builder.Default
    @Column(name = "ai_insights", nullable = false)
    private boolean aiInsights = true;

    @Builder.Default
    @Column(name = "bill_reminders", nullable = false)
    private boolean billReminders = true;

    @Builder.Default
    @Column(name = "investment_alerts", nullable = false)
    private boolean investmentAlerts = true;
}
