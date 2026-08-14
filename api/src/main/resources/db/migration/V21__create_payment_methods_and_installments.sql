CREATE TABLE payment_methods (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL,
    brand VARCHAR(50),
    color VARCHAR(20),
    last_four_digits VARCHAR(4),
    credit_limit DECIMAL(15, 2),
    current_balance DECIMAL(15, 2),
    invoice_closing_day INTEGER,
    invoice_due_day INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE installment_purchases (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    description VARCHAR(255) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    installments_count INTEGER NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE installment_entries (
    id UUID PRIMARY KEY,
    purchase_id UUID NOT NULL REFERENCES installment_purchases(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE transactions ADD COLUMN payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;
ALTER TABLE transactions RENAME COLUMN payment_method TO payment_method_type;
ALTER TABLE transactions ALTER COLUMN payment_method_type DROP NOT NULL;

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_installment_purchases_user_id ON installment_purchases(user_id);
CREATE INDEX idx_installment_entries_purchase_id ON installment_entries(purchase_id);
CREATE INDEX idx_installment_entries_due_date ON installment_entries(due_date);

-- Seed Payment Methods and Transactions for the test user
-- Bank Accounts
INSERT INTO payment_methods (id, user_id, institution_id, name, type, color, current_balance, is_active, created_at, updated_at) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Conta Principal Bradesco', 'CHECKING_ACCOUNT', '#B91C1C', 2500.00, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Conta Reserva Nubank', 'CHECKING_ACCOUNT', '#8A05BE', 1200.50, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Credit Cards
INSERT INTO payment_methods (id, user_id, institution_id, name, type, brand, color, last_four_digits, credit_limit, current_balance, invoice_closing_day, invoice_due_day, is_active, created_at, updated_at) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nubank Platinum', 'CREDIT_CARD', 'MASTERCARD', '#8A05BE', '4589', 5000.00, 450.20, 10, 15, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Inter Black', 'CREDIT_CARD', 'MASTERCARD', '#FF7A00', '1234', 10000.00, 0.00, 5, 10, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Transactions
INSERT INTO transactions (id, user_id, category_id, type, amount, description, payment_method_type, payment_method_id, date, is_recurring, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Salário' LIMIT 1), 'INCOME', 5500.00, 'Salário Mensal', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Moradia' LIMIT 1), 'EXPENSE', 1500.00, 'Aluguel do Apartamento', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Alimentação' LIMIT 1), 'EXPENSE', 120.50, 'Supermercado Mensal', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Transporte' LIMIT 1), 'EXPENSE', 45.00, 'Combustível', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Lazer' LIMIT 1), 'EXPENSE', 89.90, 'Assinatura Streaming', 'CREDIT_CARD', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', (SELECT id FROM categories WHERE name = 'Freelance' LIMIT 1), 'INCOME', 800.00, 'Projeto Site Cliente X', 'BANK_TRANSFER', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
