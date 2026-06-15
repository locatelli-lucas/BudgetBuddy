CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    budget_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    unusual_spending_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    ai_insights BOOLEAN NOT NULL DEFAULT TRUE,
    bill_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    investment_alerts BOOLEAN NOT NULL DEFAULT TRUE
);
