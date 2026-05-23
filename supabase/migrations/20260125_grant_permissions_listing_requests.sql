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
