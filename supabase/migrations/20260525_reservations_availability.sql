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
