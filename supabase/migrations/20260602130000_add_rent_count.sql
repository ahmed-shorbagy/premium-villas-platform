-- Add rent_count column to public.properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS rent_count integer DEFAULT 0;
