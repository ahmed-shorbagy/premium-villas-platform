-- Add listing_type column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS listing_type text CHECK (listing_type IN ('sale', 'rent')) DEFAULT 'sale';

-- If the column was just added, we might want to update existing rows (optional, default handles it)
-- UPDATE public.properties SET listing_type = 'sale' WHERE listing_type IS NULL;
