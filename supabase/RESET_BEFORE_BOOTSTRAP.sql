-- Run ONLY if a previous bootstrap failed partway through.
-- Then run FRESH_PROJECT_BOOTSTRAP.sql.
--
-- Note: Storage buckets cannot be deleted via SQL on hosted Supabase.
-- Leave existing buckets as-is; bootstrap uses ON CONFLICT for buckets.

-- Functions first (depend on types/tables)
DROP FUNCTION IF EXISTS public.create_listing_request CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role) CASCADE;

-- Public tables
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.listing_requests CASCADE;
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Enums
DROP TYPE IF EXISTS public.listing_type CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Storage RLS policies only (safe to drop; buckets stay in Dashboard)
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload banners" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload listing request images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing request images" ON storage.objects;
