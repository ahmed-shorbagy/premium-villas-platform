-- Shima AK — fresh Supabase project bootstrap
-- Project: idnehwkrufbgfmlkexvi
-- Run once on an EMPTY database (SQL Editor → New query → Run)
-- Generated: 2026-06-03T05:56:23.954Z


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

