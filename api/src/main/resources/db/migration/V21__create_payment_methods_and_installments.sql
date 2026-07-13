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
