-- Add email_verified to users
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Create auth_providers table
CREATE TABLE auth_providers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(150),
    provider_picture VARCHAR(500),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_auth_providers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_provider_id UNIQUE (provider, provider_id)
);

CREATE INDEX idx_auth_providers_user_id ON auth_providers(user_id);

-- Mark existing users as email verified if they had password (assuming they verified via email link or similar in a real app)
-- For this migration, we'll mark all as false unless we know they are verified.
UPDATE users SET email_verified = TRUE WHERE password_hash IS NOT NULL;
