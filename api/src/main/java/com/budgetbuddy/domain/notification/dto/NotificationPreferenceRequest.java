package com.budgetbuddy.domain.notification.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceRequest {
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
