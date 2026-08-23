-- Invert villa_availability: rows are now blocked/unavailable inclusive ranges.
-- All other dates are open by default. Old whitelist windows would incorrectly
-- become closed, so they are cleared.

COMMENT ON TABLE public.villa_availability IS
  'Blocked/unavailable date ranges. available_from and available_to are inclusive. Dates not covered by a row are bookable unless reserved.';

COMMENT ON COLUMN public.villa_availability.available_from IS
  'Inclusive start of a blocked/unavailable range.';

COMMENT ON COLUMN public.villa_availability.available_to IS
  'Inclusive end of a blocked/unavailable range.';

DELETE FROM public.villa_availability;

-- Optional date window so calendars can fetch only overlapping reservations.
DROP FUNCTION IF EXISTS public.get_booked_ranges(uuid[]);

CREATE FUNCTION public.get_booked_ranges(
  p_property_ids uuid[],
  p_from date DEFAULT NULL,
  p_to date DEFAULT NULL
)
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
     AND r.check_out IS NOT NULL
     AND (p_from IS NULL OR r.check_out >= p_from)
     AND (p_to IS NULL OR r.check_in <= p_to);
$$;

REVOKE ALL ON FUNCTION public.get_booked_ranges(uuid[], date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_booked_ranges(uuid[], date, date) TO anon, authenticated;
