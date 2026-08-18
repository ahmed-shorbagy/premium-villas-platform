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
