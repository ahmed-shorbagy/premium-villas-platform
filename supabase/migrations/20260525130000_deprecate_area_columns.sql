-- Area fields no longer collected in the app; keep columns with defaults for compatibility
ALTER TABLE public.properties
  ALTER COLUMN area SET DEFAULT '',
  ALTER COLUMN area_size SET DEFAULT 0;

ALTER TABLE public.listing_requests
  ALTER COLUMN area SET DEFAULT '',
  ALTER COLUMN area_size SET DEFAULT 0;
