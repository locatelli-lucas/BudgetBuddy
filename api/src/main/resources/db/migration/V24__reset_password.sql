-- Update test user password to '123456' using a verified BCrypt hash (exactly 60 characters)
UPDATE users
SET password_hash = '$2a$12$1BFImc2spoEZ5282b7gRrO9TLn75ka6bZF3rO9R1ZrZB.3kOJnnIO'
WHERE email = 'test@test.com';
