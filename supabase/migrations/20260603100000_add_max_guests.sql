-- Add max_guests column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS max_guests INTEGER;
