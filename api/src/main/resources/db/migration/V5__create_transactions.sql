CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    notes TEXT,
    payment_method VARCHAR(30) NOT NULL,
    date DATE NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_rule VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
