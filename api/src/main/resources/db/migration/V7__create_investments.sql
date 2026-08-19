CREATE TABLE investments (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(30) NOT NULL,
    quantity DECIMAL(15, 6) NOT NULL,
    avg_price DECIMAL(15, 4) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Seed Investments for the test user
INSERT INTO investments (id, user_id, ticker, name, type, quantity, avg_price, purchase_date, created_at, updated_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PETR4', 'Petrobras PN', 'STOCK', 100, 35.50, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VALE3', 'Vale ON', 'STOCK', 50, 72.20, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IVVB11', 'iShares S&P 500 ETF', 'ETF', 20, 245.10, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MXRF11', 'Maxi Renda FII', 'FII', 200, 10.50, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BTC', 'Bitcoin', 'CRYPTO', 0.005, 345000.00, CURRENT_DATE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
