-- Add rating columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Add payment_mode column to crops table
ALTER TABLE crops ADD COLUMN IF NOT EXISTS payment_mode VARCHAR(50);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'pending';
