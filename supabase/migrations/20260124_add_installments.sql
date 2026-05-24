-- Installment columns on properties only (listing_requests created with columns in 20260123120000)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS installments_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_period TEXT,
ADD COLUMN IF NOT EXISTS installment_value NUMERIC;
