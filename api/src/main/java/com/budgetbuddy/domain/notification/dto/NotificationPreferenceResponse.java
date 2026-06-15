package com.budgetbuddy.domain.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {
    private String id;
    private boolean budgetAlerts;
    private boolean unusualSpendingAlerts;
    private boolean aiInsights;
    private boolean billReminders;
    private boolean investmentAlerts;
}
