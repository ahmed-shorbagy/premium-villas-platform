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
