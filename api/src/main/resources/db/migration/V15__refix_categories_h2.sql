-- Fix: V4 used gen_random_uuid() which returns NULL in H2.
-- Re-seed default categories with deterministic UUIDs (works on H2 and PostgreSQL).
DELETE FROM categories WHERE is_default = TRUE;

INSERT INTO categories (id, name, icon, color, type, is_default) VALUES
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c01', 'Alimentação', 'restaurant', '#FFB4AB', 'EXPENSE', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c02', 'Moradia', 'home', '#B4C5FF', 'EXPENSE', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c03', 'Transporte', 'directions-car', '#EADDFF', 'EXPENSE', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c04', 'Saúde', 'medical-services', '#FFD8E4', 'EXPENSE', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c05', 'Educação', 'school', '#F2B8B5', 'EXPENSE', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c06', 'Lazer', 'sports-esports', '#FFDE9C', 'EXPENSE', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c07', 'Salário', 'payments', '#22C55E', 'INCOME', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c08', 'Investimentos', 'trending-up', '#6EE7B7', 'INCOME', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c09', 'Freelance', 'work', '#34D399', 'INCOME', TRUE),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c0a', 'Outros', 'category', '#C3C6D7', 'BOTH', TRUE);
