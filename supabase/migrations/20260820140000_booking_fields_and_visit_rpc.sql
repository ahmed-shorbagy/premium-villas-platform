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
