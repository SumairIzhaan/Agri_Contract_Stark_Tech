-- Add expected_delivery_date column to crops table
ALTER TABLE crops ADD COLUMN IF NOT EXISTS expected_delivery_date DATE;
