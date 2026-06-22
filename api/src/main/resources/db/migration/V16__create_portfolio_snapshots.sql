-- V16: Create portfolio_snapshots table for daily portfolio value tracking
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    portfolio_value DECIMAL(15, 4) NOT NULL,
    invested_amount DECIMAL(15, 4) NOT NULL,
    profit_loss DECIMAL(15, 4) NOT NULL,
    profit_loss_percentage DECIMAL(8, 4) NOT NULL,
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolio_snapshot_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_snapshot_date UNIQUE (user_id, snapshot_date)
);

CREATE INDEX idx_portfolio_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date);
