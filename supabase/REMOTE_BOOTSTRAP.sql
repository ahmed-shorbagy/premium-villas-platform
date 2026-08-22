-- Shima AK — fresh Supabase project bootstrap
-- Project: pumuujvmjpcbipjnckoe
-- Run once on an EMPTY database (SQL Editor → New query → Run)
-- Generated: 2026-08-22T06:40:18.324Z


-- ═══════════════════════════════════════
-- 20251218085839_7c7267c8-0c05-4cc1-a804-ca0aae0aa4a4.sql
-- ═══════════════════════════════════════

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('apartment', 'villa', 'commercial', 'duplex')),
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    area TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms INTEGER NOT NULL DEFAULT 0,
    area_size NUMERIC NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Public can read properties
CREATE POLICY "Anyone can view properties" ON public.properties
FOR SELECT USING (true);

-- Admins can insert properties
CREATE POLICY "Admins can insert properties" ON public.properties
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update properties
CREATE POLICY "Admins can update properties" ON public.properties
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete properties
CREATE POLICY "Admins can delete properties" ON public.properties
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Anyone can view settings" ON public.site_settings
FOR SELECT USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage settings" ON public.site_settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create analytics table
CREATE TABLE public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on analytics
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (for tracking)
CREATE POLICY "Anyone can insert analytics" ON public.analytics
FOR INSERT WITH CHECK (true);

-- Admins can view analytics
CREATE POLICY "Admins can view analytics" ON public.analytics
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES 
('banner', '{"image_url": "", "enabled": true}'),
('google_ads', '{"enabled": true}');

-- Create storage buckets (idempotent — safe if buckets already exist in Dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images
CREATE POLICY "Anyone can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete property images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for banners
CREATE POLICY "Anyone can view banners" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Admins can upload banners" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banners" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

-- ═══════════════════════════════════════
-- 20251218085906_8c9410f2-e014-4669-b3b0-d6a630389118.sql
-- ═══════════════════════════════════════

-- Add RLS policy for user_roles - only admins can view roles
CREATE POLICY "Admins can view user roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Users can see their own role
CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- ═══════════════════════════════════════
-- 20251218085907_add_contact_info_to_properties.sql
-- ═══════════════════════════════════════

-- Add contact info columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_location TEXT;


-- ═══════════════════════════════════════
-- 20251229120000_add_features.sql
-- ═══════════════════════════════════════

ALTER TABLE "public"."properties" ADD COLUMN "features" text[] DEFAULT '{}';


-- ═══════════════════════════════════════
-- 20251231154500_add_listing_type.sql
-- ═══════════════════════════════════════

-- Create an enum for listing type if not exists
DO $$ BEGIN
    CREATE TYPE listing_type AS ENUM ('sale', 'rent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add listing_type column to properties table
ALTER TABLE "public"."properties" ADD COLUMN "listing_type" listing_type DEFAULT 'sale';


-- ═══════════════════════════════════════
-- 20260123120000_create_listing_requests.sql
-- ═══════════════════════════════════════

-- listing_requests must exist before installments RPC and related grants
CREATE TABLE IF NOT EXISTS public.listing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    area TEXT NOT NULL,
    area_size NUMERIC NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms INTEGER NOT NULL DEFAULT 0,
    features TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    contact_location TEXT,
    installments_available BOOLEAN DEFAULT false,
    installment_period TEXT,
    installment_value NUMERIC,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert listing requests" ON public.listing_requests;
DROP POLICY IF EXISTS "Admins can view listing requests" ON public.listing_requests;
DROP POLICY IF EXISTS "Admins can update listing requests" ON public.listing_requests;
DROP POLICY IF EXISTS "Admins can delete listing requests" ON public.listing_requests;

CREATE POLICY "Anyone can insert listing requests" ON public.listing_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view listing requests" ON public.listing_requests
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update listing requests" ON public.listing_requests
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete listing requests" ON public.listing_requests
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Listing request image uploads (property-images bucket)
DROP POLICY IF EXISTS "Anyone can upload listing request images" ON storage.objects;
CREATE POLICY "Anyone can upload listing request images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = 'listing-requests'
);

DROP POLICY IF EXISTS "Anyone can view listing request images" ON storage.objects;
CREATE POLICY "Anyone can view listing request images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');


-- ═══════════════════════════════════════
-- 20260124_add_installments.sql
-- ═══════════════════════════════════════

-- Installment columns on properties only (listing_requests created with columns in 20260123120000)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS installments_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installment_period TEXT,
ADD COLUMN IF NOT EXISTS installment_value NUMERIC;


-- ═══════════════════════════════════════
-- 20260125_create_rpc_submit_listing.sql
-- ═══════════════════════════════════════

-- Create a secure function to handle listing submissions bypassing RLS
CREATE OR REPLACE FUNCTION public.create_listing_request(
    p_title TEXT,
    p_description TEXT,
    p_type TEXT,
    p_listing_type TEXT,
    p_price NUMERIC,
    p_location TEXT,
    p_area TEXT,
    p_area_size NUMERIC,
    p_bedrooms INTEGER,
    p_bathrooms INTEGER,
    p_features TEXT[],
    p_images TEXT[],
    p_contact_name TEXT,
    p_contact_phone TEXT,
    p_contact_email TEXT,
    p_contact_location TEXT,
    p_installments_available BOOLEAN DEFAULT false,
    p_installment_period TEXT DEFAULT null,
    p_installment_value NUMERIC DEFAULT null
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- THIS IS THE KEY: Runs as the creator (admin), bypassing table RLS
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO public.listing_requests (
        title,
        description,
        type,
        listing_type,
        price,
        location,
        area,
        area_size,
        bedrooms,
        bathrooms,
        features,
        images,
        contact_name,
        contact_phone,
        contact_email,
        contact_location,
        installments_available,
        installment_period,
        installment_value,
        status
    ) VALUES (
        p_title,
        p_description,
        p_type,
        p_listing_type,
        p_price,
        p_location,
        p_area,
        p_area_size,
        p_bedrooms,
        p_bathrooms,
        p_features,
        p_images,
        p_contact_name,
        p_contact_phone,
        p_contact_email,
        p_contact_location,
        p_installments_available,
        p_installment_period,
        p_installment_value,
        'pending'
    ) RETURNING to_jsonb(listing_requests.*) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execution permission to everyone (public/anon and authenticated)
GRANT EXECUTE ON FUNCTION public.create_listing_request TO anon, authenticated;


-- ═══════════════════════════════════════
-- 20260125_grant_permissions_listing_requests.sql
-- ═══════════════════════════════════════

-- Grant permissions to anon and authenticated roles
GRANT INSERT ON public.listing_requests TO anon, authenticated;
GRANT SELECT ON public.listing_requests TO anon, authenticated;
GRANT UPDATE ON public.listing_requests TO anon, authenticated;

-- Ensure the sequence (if implicit via SERIAL/IDENTITY, though here we use UUID) is accessible if needed, 
-- but for UUID PKs it's fine. 
-- Just in case there are other sequences:
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Re-apply the policy just to be absolutely sure (idempotent-ish)
DROP POLICY IF EXISTS "Anyone can insert listing requests" ON public.listing_requests;

CREATE POLICY "Anyone can insert listing requests" ON public.listing_requests
FOR INSERT TO public WITH CHECK (true);


-- ═══════════════════════════════════════
-- 20260202132700_update_property_types.sql
-- ═══════════════════════════════════════

-- Update properties type check constraint to include 'office'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties
ADD CONSTRAINT properties_type_check 
CHECK (type IN ('apartment', 'villa', 'commercial', 'duplex', 'office'));


-- ═══════════════════════════════════════
-- 20260205_add_land_type.sql
-- ═══════════════════════════════════════

-- Update properties type check constraint to include 'land'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties
ADD CONSTRAINT properties_type_check 
CHECK (type IN ('apartment', 'villa', 'commercial', 'duplex', 'office', 'land'));


-- ═══════════════════════════════════════
-- 20260228130000_create_banners_table.sql
-- ═══════════════════════════════════════

-- Hero carousel banners (admin-managed)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
CREATE POLICY "Anyone can view active banners" ON public.banners
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all banners" ON public.banners;
CREATE POLICY "Admins can view all banners" ON public.banners
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
CREATE POLICY "Admins can insert banners" ON public.banners
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
CREATE POLICY "Admins can update banners" ON public.banners
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;
CREATE POLICY "Admins can delete banners" ON public.banners
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════
-- 20260525120000_add_group_type_to_properties.sql
-- ═══════════════════════════════════════

-- Audience / rental group for villa listings
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS group_type TEXT CHECK (group_type IN ('family', 'youth_male', 'women_only'));


-- ═══════════════════════════════════════
-- 20260525130000_deprecate_area_columns.sql
-- ═══════════════════════════════════════

-- Area fields no longer collected in the app; keep columns with defaults for compatibility
ALTER TABLE public.properties
  ALTER COLUMN area SET DEFAULT '',
  ALTER COLUMN area_size SET DEFAULT 0;

ALTER TABLE public.listing_requests
  ALTER COLUMN area SET DEFAULT '',
  ALTER COLUMN area_size SET DEFAULT 0;


-- ═══════════════════════════════════════
-- 20260525_reservations_availability.sql
-- ═══════════════════════════════════════

-- =====================================================
-- RESERVATIONS TABLE
-- =====================================================
-- Stores all villa booking requests from customers

CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Villa reference
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Customer info (PRIVATE — admin-only access)
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_notes text,
  
  -- Reservation dates
  check_in date NOT NULL,
  check_out date NOT NULL,
  num_guests integer DEFAULT 1,
  
  -- Pricing snapshot
  pricing_type text NOT NULL DEFAULT 'per_night' CHECK (pricing_type IN ('per_night', 'per_stay')),
  price_per_night numeric,
  total_price numeric NOT NULL,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes text,
  
  -- WhatsApp notification tracking
  whatsapp_notified boolean DEFAULT false,
  whatsapp_notified_at timestamptz,
  
  -- Timestamps
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a reservation (no auth required for customers)
CREATE POLICY "Anyone can submit reservations"
  ON public.reservations FOR INSERT WITH CHECK (true);

-- Only admins can view reservations
CREATE POLICY "Admins can view reservations"
  ON public.reservations FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

-- Only admins can update reservations
CREATE POLICY "Admins can update reservations"
  ON public.reservations FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

-- Only admins can delete reservations
CREATE POLICY "Admins can delete reservations"
  ON public.reservations FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));


-- =====================================================
-- VILLA AVAILABILITY TABLE
-- =====================================================
-- Admin-managed date ranges when each villa is available

CREATE TABLE IF NOT EXISTS public.villa_availability (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Date range
  available_from date NOT NULL,
  available_to date NOT NULL,
  
  -- Optional price override for seasonal pricing
  price_override numeric,
  
  -- Notes (e.g. "Eid season", "Summer rates")
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  
  CONSTRAINT valid_date_range CHECK (available_to >= available_from)
);

ALTER TABLE public.villa_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can read availability (customers need to see available dates)
CREATE POLICY "Anyone can view availability"
  ON public.villa_availability FOR SELECT USING (true);

-- Only admins can manage availability
CREATE POLICY "Admins can insert availability"
  ON public.villa_availability FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update availability"
  ON public.villa_availability FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can delete availability"
  ON public.villa_availability FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));


-- =====================================================
-- ADD PRICING TYPE TO PROPERTIES
-- =====================================================
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS pricing_type text DEFAULT 'per_night' 
    CHECK (pricing_type IN ('per_night', 'per_stay'));


-- ═══════════════════════════════════════
-- 20260602120000_add_price_weekend.sql
-- ═══════════════════════════════════════

-- Add price_weekend column to public.properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS price_weekend numeric;

-- Also check/update any other tables if needed. No other tables require this since the reservation stores the total_price which we will calculate dynamically.


-- ═══════════════════════════════════════
-- 20260602130000_add_rent_count.sql
-- ═══════════════════════════════════════

-- Add rent_count column to public.properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS rent_count integer DEFAULT 0;


-- ═══════════════════════════════════════
-- 20260602140000_make_reservation_dates_optional.sql
-- ═══════════════════════════════════════

-- Make dates and price optional in reservations since the UI form will no longer require them
ALTER TABLE public.reservations ALTER COLUMN check_in DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN check_out DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN total_price DROP NOT NULL;


-- ═══════════════════════════════════════
-- 20260603090000_update_group_type_check.sql
-- ═══════════════════════════════════════

-- Update group_type constraint to allow 'all'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_group_type_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_group_type_check CHECK (group_type IN ('family', 'youth_male', 'women_only', 'all'));


-- ═══════════════════════════════════════
-- 20260603100000_add_max_guests.sql
-- ═══════════════════════════════════════

-- Add max_guests column to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS max_guests INTEGER;


-- ═══════════════════════════════════════
-- 20260603110000_add_is_negotiable.sql
-- ═══════════════════════════════════════

-- Add is_negotiable column to properties table
ALTER TABLE properties ADD COLUMN is_negotiable boolean DEFAULT false;


-- ═══════════════════════════════════════
-- 20260818153000_count_unique_visitors.sql
-- ═══════════════════════════════════════

-- Fast unique-visitor count without downloading analytics rows to the client.
CREATE OR REPLACE FUNCTION public.count_unique_visitors()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT metadata->>'visitor_id')
  FROM public.analytics
  WHERE event_type = 'page_view'
    AND metadata ? 'visitor_id';
$$;

REVOKE ALL ON FUNCTION public.count_unique_visitors() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_unique_visitors() TO authenticated;


-- ═══════════════════════════════════════
-- 20260820140000_booking_fields_and_visit_rpc.sql
-- ═══════════════════════════════════════

-- Persist guest address and booking group type on reservations
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS customer_location text,
  ADD COLUMN IF NOT EXISTS booking_group_type text;

-- Unique visitors excluding admin routes
CREATE OR REPLACE FUNCTION public.count_unique_visitors()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT metadata->>'visitor_id')
    FROM public.analytics
   WHERE event_type = 'page_view'
     AND metadata ? 'visitor_id'
     AND COALESCE(metadata->>'path', '') NOT LIKE '/admin%';
$$;

REVOKE ALL ON FUNCTION public.count_unique_visitors() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_unique_visitors() TO authenticated;

-- Page views excluding admin routes
CREATE OR REPLACE FUNCTION public.count_public_page_views()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
    FROM public.analytics
   WHERE event_type = 'page_view'
     AND COALESCE(metadata->>'path', '') NOT LIKE '/admin%';
$$;

REVOKE ALL ON FUNCTION public.count_public_page_views() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.count_public_page_views() TO authenticated;

-- Public: booked date ranges only (no customer PII) for calendars / alternatives
CREATE OR REPLACE FUNCTION public.get_booked_ranges(p_property_ids uuid[])
RETURNS TABLE (
  property_id uuid,
  check_in date,
  check_out date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.property_id, r.check_in::date, r.check_out::date
    FROM public.reservations r
   WHERE r.property_id = ANY (p_property_ids)
     AND r.status IN ('pending', 'confirmed')
     AND r.check_in IS NOT NULL
     AND r.check_out IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_booked_ranges(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_ranges(uuid[]) TO anon, authenticated;


-- ═══════════════════════════════════════
-- 20260820150000_add_property_is_hidden.sql
-- ═══════════════════════════════════════

-- Soft-hide villas from public site without deleting them
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS properties_is_hidden_idx
  ON public.properties (is_hidden)
  WHERE is_hidden = false;


-- ═══════════════════════════════════════
-- 20260822093000_owner_access.sql
-- ═══════════════════════════════════════

-- Secure, reusable owner links with property-scoped availability access.
-- Bearer secrets are generated by an Edge Function; only their SHA-256 hashes
-- are stored in this schema.

CREATE TABLE IF NOT EXISTS public.property_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 120),
  phone text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.owner_property_assignments (
  owner_id uuid NOT NULL REFERENCES public.property_owners(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, property_id)
);

CREATE INDEX IF NOT EXISTS owner_property_assignments_property_idx
  ON public.owner_property_assignments(property_id);

CREATE TABLE IF NOT EXISTS public.owner_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.property_owners(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE
    CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  label text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS owner_access_tokens_one_active_idx
  ON public.owner_access_tokens(owner_id)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.owner_access_audit (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  owner_id uuid REFERENCES public.property_owners(id) ON DELETE SET NULL,
  token_id uuid REFERENCES public.owner_access_tokens(id) ON DELETE SET NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  action text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS owner_access_audit_owner_created_idx
  ON public.owner_access_audit(owner_id, created_at DESC);

-- Production was bootstrapped without the historical has_role helper, so this
-- migration carries its own idempotent admin predicate.
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.user_roles
     WHERE user_id = _user_id
       AND role::text = 'admin'
  )
$$;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

ALTER TABLE public.property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_property_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_access_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage property owners" ON public.property_owners;
CREATE POLICY "Admins can manage property owners"
  ON public.property_owners FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage owner assignments" ON public.owner_property_assignments;
CREATE POLICY "Admins can manage owner assignments"
  ON public.owner_property_assignments FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view owner access audit" ON public.owner_access_audit;
CREATE POLICY "Admins can view owner access audit"
  ON public.owner_access_audit FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

REVOKE ALL ON public.property_owners FROM anon, authenticated;
REVOKE ALL ON public.owner_property_assignments FROM anon, authenticated;
REVOKE ALL ON public.owner_access_tokens FROM anon, authenticated;
REVOKE ALL ON public.owner_access_audit FROM anon, authenticated;

-- Admin writes are transaction-safe and re-check the admin role inside the
-- database, even though the calling Edge Function also verifies it.
CREATE OR REPLACE FUNCTION public.admin_save_property_owner(
  p_admin_id uuid,
  p_owner_id uuid,
  p_display_name text,
  p_phone text,
  p_email text,
  p_is_active boolean,
  p_property_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner_id uuid;
  v_property_ids uuid[] := COALESCE(p_property_ids, ARRAY[]::uuid[]);
BEGIN
  IF NOT public.is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Admin role required' USING ERRCODE = '42501';
  END IF;

  IF length(btrim(COALESCE(p_display_name, ''))) NOT BETWEEN 1 AND 120 THEN
    RAISE EXCEPTION 'Owner name is required' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
      FROM unnest(v_property_ids) AS requested(property_id)
      LEFT JOIN public.properties p ON p.id = requested.property_id
     WHERE p.id IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more properties do not exist' USING ERRCODE = '22023';
  END IF;

  IF p_owner_id IS NULL THEN
    INSERT INTO public.property_owners (
      display_name, phone, email, is_active, created_by
    )
    VALUES (
      btrim(p_display_name),
      NULLIF(btrim(COALESCE(p_phone, '')), ''),
      NULLIF(btrim(COALESCE(p_email, '')), ''),
      COALESCE(p_is_active, true),
      p_admin_id
    )
    RETURNING id INTO v_owner_id;
  ELSE
    UPDATE public.property_owners
       SET display_name = btrim(p_display_name),
           phone = NULLIF(btrim(COALESCE(p_phone, '')), ''),
           email = NULLIF(btrim(COALESCE(p_email, '')), ''),
           is_active = COALESCE(p_is_active, true),
           updated_at = now()
     WHERE id = p_owner_id
     RETURNING id INTO v_owner_id;

    IF v_owner_id IS NULL THEN
      RAISE EXCEPTION 'Owner not found' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  DELETE FROM public.owner_property_assignments
   WHERE owner_id = v_owner_id;

  INSERT INTO public.owner_property_assignments (
    owner_id, property_id, assigned_by
  )
  SELECT v_owner_id, property_id, p_admin_id
    FROM (SELECT DISTINCT unnest(v_property_ids) AS property_id) requested;

  IF NOT COALESCE(p_is_active, true) THEN
    UPDATE public.owner_access_tokens
       SET revoked_at = COALESCE(revoked_at, now())
     WHERE owner_id = v_owner_id
       AND revoked_at IS NULL;
  END IF;

  INSERT INTO public.owner_access_audit (owner_id, action, metadata)
  VALUES (
    v_owner_id,
    'admin_owner_saved',
    jsonb_build_object(
      'admin_id', p_admin_id,
      'property_count', cardinality(v_property_ids),
      'is_active', COALESCE(p_is_active, true)
    )
  );

  RETURN v_owner_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_rotate_owner_token(
  p_admin_id uuid,
  p_owner_id uuid,
  p_token_hash text,
  p_label text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token_id uuid;
BEGIN
  IF NOT public.is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Admin role required' USING ERRCODE = '42501';
  END IF;

  IF COALESCE(lower(p_token_hash), '') !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'Invalid token hash' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
    FROM public.property_owners
   WHERE id = p_owner_id
     AND is_active
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active owner not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.owner_access_tokens
     SET revoked_at = COALESCE(revoked_at, now())
   WHERE owner_id = p_owner_id
     AND revoked_at IS NULL;

  INSERT INTO public.owner_access_tokens (
    owner_id, token_hash, label, created_by
  )
  VALUES (
    p_owner_id,
    lower(p_token_hash),
    NULLIF(btrim(COALESCE(p_label, '')), ''),
    p_admin_id
  )
  RETURNING id INTO v_token_id;

  INSERT INTO public.owner_access_audit (
    owner_id, token_id, action, metadata
  )
  VALUES (
    p_owner_id,
    v_token_id,
    'admin_token_rotated',
    jsonb_build_object('admin_id', p_admin_id)
  );

  RETURN v_token_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_owner_token(
  p_admin_id uuid,
  p_owner_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_changed boolean;
BEGIN
  IF NOT public.is_admin(p_admin_id) THEN
    RAISE EXCEPTION 'Admin role required' USING ERRCODE = '42501';
  END IF;

  UPDATE public.owner_access_tokens
     SET revoked_at = now()
   WHERE owner_id = p_owner_id
     AND revoked_at IS NULL;
  v_changed := FOUND;

  INSERT INTO public.owner_access_audit (owner_id, action, metadata)
  VALUES (
    p_owner_id,
    'admin_token_revoked',
    jsonb_build_object('admin_id', p_admin_id, 'changed', v_changed)
  );

  RETURN v_changed;
END;
$$;

-- Returns all owner-safe data in one call. Customer names, contact details,
-- reservation notes and pricing are intentionally absent.
CREATE OR REPLACE FUNCTION public.owner_portal_snapshot(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token public.owner_access_tokens%ROWTYPE;
  v_owner public.property_owners%ROWTYPE;
  v_result jsonb;
BEGIN
  SELECT *
    INTO v_token
    FROM public.owner_access_tokens
   WHERE token_hash = lower(COALESCE(p_token_hash, ''))
     AND revoked_at IS NULL
   FOR SHARE;

  IF v_token.id IS NULL THEN
    RAISE EXCEPTION 'Invalid owner access' USING ERRCODE = '42501';
  END IF;

  SELECT *
    INTO v_owner
    FROM public.property_owners
   WHERE id = v_token.owner_id
     AND is_active;

  IF v_owner.id IS NULL THEN
    RAISE EXCEPTION 'Invalid owner access' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'owner', jsonb_build_object(
      'id', v_owner.id,
      'display_name', v_owner.display_name
    ),
    'villas', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'title', p.title,
          'location', p.location,
          'images', COALESCE(p.images, ARRAY[]::text[]),
          'availability', COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', va.id,
                'available_from', va.available_from,
                'available_to', va.available_to
              )
              ORDER BY va.available_from, va.available_to
            )
              FROM public.villa_availability va
             WHERE va.property_id = p.id
          ), '[]'::jsonb),
          'booked_ranges', COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'check_in', booked.check_in,
                'check_out', booked.check_out
              )
              ORDER BY booked.check_in, booked.check_out
            )
              FROM (
                SELECT DISTINCT r.check_in::date, r.check_out::date
                  FROM public.reservations r
                 WHERE r.property_id = p.id
                   AND r.status IN ('pending', 'confirmed')
                   AND r.check_in IS NOT NULL
                   AND r.check_out IS NOT NULL
                   AND r.check_out >= CURRENT_DATE
              ) booked
          ), '[]'::jsonb),
          'stats', jsonb_build_object(
            'total_requests', (
              SELECT count(*) FROM public.reservations r
               WHERE r.property_id = p.id
            ),
            'pending_requests', (
              SELECT count(*) FROM public.reservations r
               WHERE r.property_id = p.id AND r.status = 'pending'
            ),
            'confirmed_requests', (
              SELECT count(*) FROM public.reservations r
               WHERE r.property_id = p.id AND r.status = 'confirmed'
            ),
            'availability_ranges', (
              SELECT count(*) FROM public.villa_availability va
               WHERE va.property_id = p.id
            )
          )
        )
        ORDER BY p.title
      )
        FROM public.owner_property_assignments opa
        JOIN public.properties p ON p.id = opa.property_id
       WHERE opa.owner_id = v_owner.id
    ), '[]'::jsonb)
  )
  INTO v_result;

  UPDATE public.owner_access_tokens
     SET last_used_at = now()
   WHERE id = v_token.id;

  INSERT INTO public.owner_access_audit (owner_id, token_id, action)
  VALUES (v_owner.id, v_token.id, 'portal_snapshot');

  RETURN v_result;
END;
$$;

-- Replaces one villa's availability in a single database transaction.
-- Existing period IDs retain their admin-only price_override and notes.
CREATE OR REPLACE FUNCTION public.owner_replace_availability(
  p_token_hash text,
  p_property_id uuid,
  p_periods jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_token public.owner_access_tokens%ROWTYPE;
  v_owner_id uuid;
  v_item jsonb;
  v_id uuid;
  v_from date;
  v_to date;
  v_seen_ids uuid[] := ARRAY[]::uuid[];
  v_ranges daterange[] := ARRAY[]::daterange[];
  v_range daterange;
  v_existing_range daterange;
  v_result jsonb;
BEGIN
  IF p_property_id IS NULL
     OR p_periods IS NULL
     OR jsonb_typeof(p_periods) <> 'array'
     OR jsonb_array_length(p_periods) > 100 THEN
    RAISE EXCEPTION 'Invalid availability payload' USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO v_token
    FROM public.owner_access_tokens
   WHERE token_hash = lower(COALESCE(p_token_hash, ''))
     AND revoked_at IS NULL
   FOR SHARE;

  IF v_token.id IS NULL THEN
    RAISE EXCEPTION 'Invalid owner access' USING ERRCODE = '42501';
  END IF;

  SELECT po.id
    INTO v_owner_id
    FROM public.property_owners po
    JOIN public.owner_property_assignments opa ON opa.owner_id = po.id
   WHERE po.id = v_token.owner_id
     AND po.is_active
     AND opa.property_id = p_property_id
   FOR SHARE OF po, opa;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Villa is not assigned to this owner' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_property_id::text, 0));

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_periods)
  LOOP
    IF jsonb_typeof(v_item) <> 'object'
       OR COALESCE(v_item->>'available_from', '') !~ '^\d{4}-\d{2}-\d{2}$'
       OR COALESCE(v_item->>'available_to', '') !~ '^\d{4}-\d{2}-\d{2}$' THEN
      RAISE EXCEPTION 'Every period requires valid dates' USING ERRCODE = '22023';
    END IF;

    v_from := (v_item->>'available_from')::date;
    v_to := (v_item->>'available_to')::date;
    IF v_to < v_from THEN
      RAISE EXCEPTION 'Availability end date cannot precede start date'
        USING ERRCODE = '22023';
    END IF;

    v_range := daterange(v_from, v_to, '[]');
    FOREACH v_existing_range IN ARRAY v_ranges
    LOOP
      IF v_existing_range && v_range THEN
        RAISE EXCEPTION 'Availability periods cannot overlap'
          USING ERRCODE = '22023';
      END IF;
    END LOOP;
    v_ranges := array_append(v_ranges, v_range);

    IF NULLIF(v_item->>'id', '') IS NOT NULL THEN
      v_id := (v_item->>'id')::uuid;
      IF v_id = ANY(v_seen_ids) THEN
        RAISE EXCEPTION 'Duplicate availability period'
          USING ERRCODE = '22023';
      END IF;

      PERFORM 1
        FROM public.villa_availability
       WHERE id = v_id
         AND property_id = p_property_id
       FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Availability period does not belong to this villa'
          USING ERRCODE = '42501';
      END IF;
      v_seen_ids := array_append(v_seen_ids, v_id);
    END IF;
  END LOOP;

  DELETE FROM public.villa_availability
   WHERE property_id = p_property_id
     AND id <> ALL(v_seen_ids);

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_periods)
  LOOP
    v_from := (v_item->>'available_from')::date;
    v_to := (v_item->>'available_to')::date;
    IF NULLIF(v_item->>'id', '') IS NULL THEN
      INSERT INTO public.villa_availability (
        property_id, available_from, available_to
      )
      VALUES (p_property_id, v_from, v_to);
    ELSE
      UPDATE public.villa_availability
         SET available_from = v_from,
             available_to = v_to,
             updated_at = now()
       WHERE id = (v_item->>'id')::uuid
         AND property_id = p_property_id;
    END IF;
  END LOOP;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', va.id,
        'available_from', va.available_from,
        'available_to', va.available_to
      )
      ORDER BY va.available_from, va.available_to
    ),
    '[]'::jsonb
  )
  INTO v_result
  FROM public.villa_availability va
  WHERE va.property_id = p_property_id;

  UPDATE public.owner_access_tokens
     SET last_used_at = now()
   WHERE id = v_token.id;

  INSERT INTO public.owner_access_audit (
    owner_id, token_id, property_id, action, metadata
  )
  VALUES (
    v_owner_id,
    v_token.id,
    p_property_id,
    'availability_replaced',
    jsonb_build_object('period_count', jsonb_array_length(p_periods))
  );

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_save_property_owner(
  uuid, uuid, text, text, text, boolean, uuid[]
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_rotate_owner_token(
  uuid, uuid, text, text
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_revoke_owner_token(
  uuid, uuid
) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.owner_portal_snapshot(text)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.owner_replace_availability(text, uuid, jsonb)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.admin_save_property_owner(
  uuid, uuid, text, text, text, boolean, uuid[]
) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_rotate_owner_token(
  uuid, uuid, text, text
) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_revoke_owner_token(
  uuid, uuid
) TO service_role;
GRANT EXECUTE ON FUNCTION public.owner_portal_snapshot(text)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.owner_replace_availability(text, uuid, jsonb)
  TO service_role;

