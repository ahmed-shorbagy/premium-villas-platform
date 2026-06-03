-- Add is_negotiable column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_negotiable boolean DEFAULT false;
