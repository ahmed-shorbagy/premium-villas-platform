-- Create an enum for listing type if not exists
DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('sale', 'rent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add listing_type column to properties table
ALTER TABLE "public"."properties" ADD COLUMN "listing_type" listing_type DEFAULT 'sale';
