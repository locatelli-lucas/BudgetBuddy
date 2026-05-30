-- Seed default system categories (user_id is NULL)
INSERT INTO categories (id, name, icon, color, type, is_default) VALUES
    (gen_random_uuid(), 'Alimentação', 'restaurant', '#FFB4AB', 'EXPENSE', TRUE),
    (gen_random_uuid(), 'Moradia', 'home', '#B4C5FF', 'EXPENSE', TRUE),
    (gen_random_uuid(), 'Transporte', 'directions_car', '#EADDFF', 'EXPENSE', TRUE),
    (gen_random_uuid(), 'Saúde', 'medical_services', '#FFD8E4', 'EXPENSE', TRUE),
    (gen_random_uuid(), 'Educação', 'school', '#F2B8B5', 'EXPENSE', TRUE),
    (gen_random_uuid(), 'Lazer', 'sports_esports', '#FFDE9C', 'EXPENSE', TRUE),
    (gen_random_uuid(), 'Salário', 'payments', '#22C55E', 'INCOME', TRUE),
    (gen_random_uuid(), 'Investimentos', 'trending_up', '#6EE7B7', 'INCOME', TRUE),
    (gen_random_uuid(), 'Freelance', 'work', '#34D399', 'INCOME', TRUE),
    (gen_random_uuid(), 'Outros', 'category', '#C3C6D7', 'BOTH', TRUE);
