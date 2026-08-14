CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    fcm_token VARCHAR(500),
    premium BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Seed Test User (test@test.com / 123456)
INSERT INTO users (id, name, email, password_hash, premium, created_at, updated_at)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lucas Teste', 'test@test.com', '$2a$10$7Z2vOaslB.uN9D9aYvV.z.Z1kY6QZpP2v6h8o5PzYFzV1N1YFzV1N', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
