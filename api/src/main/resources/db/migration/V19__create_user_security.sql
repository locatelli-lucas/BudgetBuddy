CREATE TABLE user_security (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    totp_secret VARCHAR(255),
    backup_codes TEXT,
    last_used_code VARCHAR(10),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_security_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migrate existing 2FA data from users table
INSERT INTO user_security (id, user_id, two_factor_enabled, totp_secret, created_at, updated_at)
SELECT gen_random_uuid(), id, two_factor_enabled, two_factor_secret, created_at, updated_at
FROM users;

-- Remove old columns from users table
ALTER TABLE users DROP COLUMN two_factor_secret;
ALTER TABLE users DROP COLUMN two_factor_enabled;

-- Create security_events table for audit logs
CREATE TABLE security_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    device VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_security_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
