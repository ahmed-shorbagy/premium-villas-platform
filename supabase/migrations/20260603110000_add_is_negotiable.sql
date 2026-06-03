-- Add is_negotiable column to properties table
ALTER TABLE properties ADD COLUMN is_negotiable boolean DEFAULT false;
