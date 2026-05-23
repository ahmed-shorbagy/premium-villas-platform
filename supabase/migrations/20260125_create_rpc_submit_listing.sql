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
