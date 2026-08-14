CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    broker_code VARCHAR(50),
    logo_url VARCHAR(500)
);

CREATE INDEX idx_institutions_user_id ON institutions(user_id);

-- Seed Institutions for the test user
INSERT INTO institutions (id, user_id, name, broker_code, logo_url) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nubank', '260', 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2019.svg'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bradesco', '237', 'https://upload.wikimedia.org/wikipedia/commons/1/12/Bradesco_logo.svg'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Inter', '077', 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Banco_Inter_logo.svg');
