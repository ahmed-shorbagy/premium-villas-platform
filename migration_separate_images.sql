-- Add new columns to properties table
ALTER TABLE public.properties ADD COLUMN card_images text[] DEFAULT '{}';
ALTER TABLE public.properties ADD COLUMN gallery_images text[] DEFAULT '{}';

-- Add new columns to listing_requests table
ALTER TABLE public.listing_requests ADD COLUMN card_images text[] DEFAULT '{}';
ALTER TABLE public.listing_requests ADD COLUMN gallery_images text[] DEFAULT '{}';

-- Migrate existing data for properties
-- Take up to the first 3 images for card_images, and the rest for gallery_images
UPDATE public.properties 
SET 
  card_images = CASE 
    WHEN array_length(images, 1) > 0 THEN images[1:least(3, array_length(images, 1))]
    ELSE '{}'::text[]
  END,
  gallery_images = CASE 
    WHEN array_length(images, 1) > 3 THEN images[4:array_length(images, 1)]
    ELSE '{}'::text[]
  END
WHERE images IS NOT NULL;

-- Migrate existing data for listing_requests
UPDATE public.listing_requests 
SET 
  card_images = CASE 
    WHEN array_length(images, 1) > 0 THEN images[1:least(3, array_length(images, 1))]
    ELSE '{}'::text[]
  END,
  gallery_images = CASE 
    WHEN array_length(images, 1) > 3 THEN images[4:array_length(images, 1)]
    ELSE '{}'::text[]
  END
WHERE images IS NOT NULL;
