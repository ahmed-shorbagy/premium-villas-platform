-- Create listing_requests table if it doesn't exist
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
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert listing requests" ON public.listing_requests;
DROP POLICY IF EXISTS "Admins can view listing requests" ON public.listing_requests;
DROP POLICY IF EXISTS "Admins can update listing requests" ON public.listing_requests;
DROP POLICY IF EXISTS "Admins can delete listing requests" ON public.listing_requests;

-- Allow public access to insert
CREATE POLICY "Anyone can insert listing requests" ON public.listing_requests
FOR INSERT WITH CHECK (true);

-- Allow admins to view all requests
CREATE POLICY "Admins can view listing requests" ON public.listing_requests
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update requests
CREATE POLICY "Admins can update listing requests" ON public.listing_requests
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete requests
CREATE POLICY "Admins can delete listing requests" ON public.listing_requests
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage Policies for 'properties' bucket
-- Ensure the bucket exists (idempotent insert not standard in SQL, relying on existing bucket or manual creation if missing, but usually this is set up)

-- Allow public to upload images to 'listing-requests' folder
DROP POLICY IF EXISTS "Anyone can upload listing request images" ON storage.objects;

CREATE POLICY "Anyone can upload listing request images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'properties' AND 
    (storage.foldername(name))[1] = 'listing-requests'
);

-- Ensure public view access (already likely exists, but reinforcing)
DROP POLICY IF EXISTS "Anyone can view listing request images" ON storage.objects;

CREATE POLICY "Anyone can view listing request images" ON storage.objects
FOR SELECT USING (bucket_id = 'properties');
