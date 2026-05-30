-- Transactions
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- Budgets
CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, month, year);

-- Investments
CREATE INDEX idx_investments_user ON investments(user_id);

-- Insights
CREATE INDEX idx_ai_insights_user_created ON ai_insights(user_id, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_sent ON notifications(user_id, sent_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id);
