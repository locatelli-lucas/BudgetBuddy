CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    broker_code VARCHAR(50),
    logo_url VARCHAR(500)
);

CREATE INDEX idx_institutions_user_id ON institutions(user_id);
