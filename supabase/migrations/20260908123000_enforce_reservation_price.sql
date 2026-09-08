-- Keep reservation totals consistent with the latest villa and holiday prices.
-- The checkout date is exclusive: a 9 Sep -> 10 Sep stay prices the night of 9 Sep.

CREATE OR REPLACE FUNCTION public.calculate_reservation_price(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_weekday_price numeric;
  v_weekend_price numeric;
  v_pricing_type text;
  v_custom_price numeric;
  v_total numeric;
BEGIN
  IF p_check_in IS NULL OR p_check_out IS NULL OR p_check_out <= p_check_in THEN
    RETURN NULL;
  END IF;

  SELECT p.price, p.price_weekend, COALESCE(p.pricing_type, 'per_night')
    INTO v_weekday_price, v_weekend_price, v_pricing_type
    FROM public.properties p
   WHERE p.id = p_property_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property not found';
  END IF;

  IF v_pricing_type = 'per_stay' THEN
    SELECT pp.price_override
      INTO v_custom_price
      FROM public.villa_price_periods pp
     WHERE pp.property_id = p_property_id
       AND p_check_in BETWEEN pp.period_start AND pp.period_end
     ORDER BY pp.period_start DESC, pp.created_at DESC, pp.id DESC
     LIMIT 1;

    RETURN COALESCE(v_custom_price, v_weekday_price);
  END IF;

  SELECT SUM(
    COALESCE(
      custom.price_override,
      CASE
        WHEN EXTRACT(DOW FROM night_date)::integer IN (4, 5)
          THEN COALESCE(v_weekend_price, v_weekday_price)
        ELSE v_weekday_price
      END
    )
  )
  INTO v_total
  FROM generate_series(
    p_check_in::timestamp,
    (p_check_out - 1)::timestamp,
    interval '1 day'
  ) AS nights(night_date)
  LEFT JOIN LATERAL (
    SELECT pp.price_override
      FROM public.villa_price_periods pp
     WHERE pp.property_id = p_property_id
       AND nights.night_date::date BETWEEN pp.period_start AND pp.period_end
     ORDER BY pp.period_start DESC, pp.created_at DESC, pp.id DESC
     LIMIT 1
  ) custom ON true;

  RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_reservation_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_weekday_price numeric;
  v_pricing_type text;
BEGIN
  IF NEW.check_in IS NULL OR NEW.check_out IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.price, COALESCE(p.pricing_type, 'per_night')
    INTO v_weekday_price, v_pricing_type
    FROM public.properties p
   WHERE p.id = NEW.property_id;

  NEW.pricing_type := v_pricing_type;
  NEW.price_per_night := CASE
    WHEN v_pricing_type = 'per_night' THEN v_weekday_price
    ELSE NULL
  END;
  NEW.total_price := public.calculate_reservation_price(
    NEW.property_id,
    NEW.check_in,
    NEW.check_out
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservations_enforce_price
  ON public.reservations;

CREATE TRIGGER reservations_enforce_price
BEFORE INSERT OR UPDATE OF property_id, check_in, check_out
ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.enforce_reservation_price();

REVOKE ALL ON FUNCTION public.calculate_reservation_price(uuid, date, date)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_reservation_price(uuid, date, date)
  TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.enforce_reservation_price()
  FROM PUBLIC, anon, authenticated;
