-- Audience / rental group for villa listings
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS group_type TEXT CHECK (group_type IN ('family', 'youth_male', 'women_only'));
