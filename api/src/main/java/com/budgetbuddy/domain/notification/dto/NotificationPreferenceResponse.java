package com.budgetbuddy.domain.notification.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {
    private UUID id;
    private boolean pushEnabled;
    private boolean financeEnabled;
    private boolean investmentEnabled;
    private boolean newsEnabled;
    private boolean aiEnabled;
    private boolean systemEnabled;
    private boolean priceAlertEnabled;
    private boolean dividendAlertEnabled;
    private boolean dailySummaryEnabled;
    private boolean weeklySummaryEnabled;
    private boolean monthlySummaryEnabled;
}
