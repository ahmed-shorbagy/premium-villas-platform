-- Add installment columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS installments_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_period TEXT,
ADD COLUMN IF NOT EXISTS installment_value NUMERIC;

-- Add installment columns to listing_requests table
ALTER TABLE listing_requests 
ADD COLUMN IF NOT EXISTS installments_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_period TEXT,
ADD COLUMN IF NOT EXISTS installment_value NUMERIC;
