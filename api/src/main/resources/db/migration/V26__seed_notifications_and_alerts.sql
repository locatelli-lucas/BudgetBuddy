-- Seed Notifications and Price Alerts for Verification
-- User: test@test.com (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)

-- 1. Create various Price Alerts
INSERT INTO price_alerts (id, user_id, symbol, condition, target_price, is_active, created_at) VALUES
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PETR4.SA', 'ABOVE', 40.00, TRUE, CURRENT_TIMESTAMP),
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VALE3.SA', 'BELOW', 60.00, TRUE, CURRENT_TIMESTAMP),
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ITUB4.SA', 'ABOVE', 35.00, TRUE, CURRENT_TIMESTAMP),
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BTC-USD', 'BELOW', 50000.00, TRUE, CURRENT_TIMESTAMP);

-- 2. Create historical notifications to test the UI
-- Finance (Unread) - 1 hour ago
INSERT INTO notifications (id, user_id, title, message, type, category, priority, is_read, created_at, action_url) VALUES
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fatura vencendo', 'Sua fatura do cartão NuBank vence amanhã. Valor: R$ 1.250,00', 'WARNING', 'FINANCE', 'HIGH', FALSE, CURRENT_TIMESTAMP - INTERVAL '1' HOUR, '/cards/nubank');

-- Investment Alert (Read) - 2 hours ago
INSERT INTO notifications (id, user_id, title, message, type, category, priority, is_read, created_at, read_at, action_url, metadata) VALUES
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PETR4.SA 📈 5.2% hoje', 'PETR4.SA subiu 5,20% no pregão de hoje. Cotação atual: R$ 38,40.', 'ALERT', 'INVESTMENTS', 'MEDIUM', TRUE, CURRENT_TIMESTAMP - INTERVAL '2' HOUR, CURRENT_TIMESTAMP - INTERVAL '1' HOUR, '/investments/PETR4.SA', '{"ticker":"PETR4.SA", "changePercent":"5.20"}');

-- System (Unread) - 1 day ago
INSERT INTO notifications (id, user_id, title, message, type, category, priority, is_read, created_at) VALUES
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bem-vindo ao BudgetBuddy!', 'Explore todas as funcionalidades para gerenciar suas finanças.', 'INFO', 'SYSTEM', 'LOW', FALSE, CURRENT_TIMESTAMP - INTERVAL '1' DAY);

-- Investment Price Triggered (Unread) - 30 minutes ago
INSERT INTO notifications (id, user_id, title, message, type, category, priority, is_read, created_at, action_url) VALUES
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alerta de Preço: AAPL', 'O ativo AAPL está acima de R$ 150,00 (Preço atual: R$ 155,20)', 'ALERT', 'INVESTMENTS', 'HIGH', FALSE, CURRENT_TIMESTAMP - INTERVAL '30' MINUTE, '/investments/AAPL');

-- AI Insight (Unread) - 12 hours ago
INSERT INTO notifications (id, user_id, title, message, type, category, priority, is_read, created_at) VALUES
(random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Insight de Gastos', 'Você gastou 15% a menos em Lazer nesta semana comparado à anterior. Bom trabalho!', 'SUCCESS', 'AI', 'MEDIUM', FALSE, CURRENT_TIMESTAMP - INTERVAL '12' HOUR);

-- Check if preferences exist, if not create them
INSERT INTO notification_preferences (id, user_id, push_enabled, finance_enabled, investment_enabled, news_enabled, ai_enabled, system_enabled, price_alert_enabled)
SELECT random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM notification_preferences WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
