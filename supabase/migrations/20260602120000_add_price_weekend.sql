-- Add price_weekend column to public.properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS price_weekend numeric;

-- Also check/update any other tables if needed. No other tables require this since the reservation stores the total_price which we will calculate dynamically.
