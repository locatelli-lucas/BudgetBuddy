-- Seed Historical Data for BudgetBuddy
-- User: test@test.com
-- Months: May, June, July 2026

-- May 2026
INSERT INTO transactions (id, user_id, category_id, type, amount, description, payment_method, financial_resource_id, date, is_recurring, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Salário' LIMIT 1), 'INCOME', 5500.00, 'Salário Maio', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-05-05', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Moradia' LIMIT 1), 'EXPENSE', 1500.00, 'Aluguel Maio', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-05-10', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Alimentação' LIMIT 1), 'EXPENSE', 850.00, 'Supermercado Maio', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2026-05-15', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Lazer' LIMIT 1), 'EXPENSE', 400.00, 'Viagem Fim de Semana', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2026-05-22', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- June 2026
INSERT INTO transactions (id, user_id, category_id, type, amount, description, payment_method, financial_resource_id, date, is_recurring, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Salário' LIMIT 1), 'INCOME', 5500.00, 'Salário Junho', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-06-05', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Moradia' LIMIT 1), 'EXPENSE', 1500.00, 'Aluguel Junho', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-06-10', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Alimentação' LIMIT 1), 'EXPENSE', 920.00, 'Supermercado Junho', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2026-06-12', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Transporte' LIMIT 1), 'EXPENSE', 200.00, 'Revisão Carro', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-06-20', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Freelance' LIMIT 1), 'INCOME', 1200.00, 'Projeto Freelance Junho', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-06-25', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- July 2026
INSERT INTO transactions (id, user_id, category_id, type, amount, description, payment_method, financial_resource_id, date, is_recurring, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Salário' LIMIT 1), 'INCOME', 5500.00, 'Salário Julho', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-07-05', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Moradia' LIMIT 1), 'EXPENSE', 1500.00, 'Aluguel Julho', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-07-10', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Alimentação' LIMIT 1), 'EXPENSE', 1100.00, 'Supermercado Julho', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2026-07-15', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Saúde' LIMIT 1), 'EXPENSE', 350.00, 'Consulta Médica', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', '2026-07-18', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
