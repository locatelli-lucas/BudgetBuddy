-- Rename tables
ALTER TABLE institutions RENAME TO financial_institutions;
ALTER TABLE payment_methods RENAME TO financial_resources;

-- Update columns in financial_resources
ALTER TABLE financial_resources RENAME COLUMN institution_id TO financial_institution_id;

-- Update columns in transactions
ALTER TABLE transactions RENAME COLUMN payment_method_id TO financial_resource_id;
ALTER TABLE transactions RENAME COLUMN payment_method_type TO payment_method;

-- Update columns in installment_purchases
ALTER TABLE installment_purchases RENAME COLUMN payment_method_id TO financial_resource_id;

-- Add CASH_WALLET to existing types if needed?
-- The Java enum handles it, and the column is VARCHAR.

-- Update indexes if they were named based on old table names (optional but good)
-- Based on V11 and V21:
-- idx_institutions_user_id
-- idx_payment_methods_user_id
-- These names still work, but could be renamed for consistency.
-- ALTER INDEX idx_institutions_user_id RENAME TO idx_financial_institutions_user_id;
-- ALTER INDEX idx_payment_methods_user_id RENAME TO idx_financial_resources_user_id;
