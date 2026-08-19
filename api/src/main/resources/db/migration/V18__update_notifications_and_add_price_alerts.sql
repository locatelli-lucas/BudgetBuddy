-- Update notifications table
ALTER TABLE notifications ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'SYSTEM';
ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN action_url VARCHAR(500);
ALTER TABLE notifications ADD COLUMN metadata TEXT;
ALTER TABLE notifications RENAME COLUMN body TO message;
ALTER TABLE notifications RENAME COLUMN sent_at TO created_at;

-- Update notification_preferences table
ALTER TABLE notification_preferences ADD COLUMN push_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN finance_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN investment_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN news_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN ai_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN system_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN price_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN dividend_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN daily_summary_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN weekly_summary_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE notification_preferences ADD COLUMN monthly_summary_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Create device_tokens table
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);

-- Create price_alerts table
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    condition VARCHAR(20) NOT NULL, -- ABOVE, BELOW
    target_price DECIMAL(19,4) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    triggered_at TIMESTAMP
);

-- Index for price alerts monitoring
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active);
