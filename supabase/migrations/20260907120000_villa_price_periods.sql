-- Seasonal / occasion prices, separate from blocked dates in villa_availability.
-- A night that falls in a period uses price_override instead of weekday/weekend rates.

CREATE TABLE IF NOT EXISTS public.villa_price_periods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  price_override numeric NOT NULL CHECK (price_override >= 0),
  notes text,
  created_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT villa_price_periods_valid_range CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS villa_price_periods_property_id_idx
  ON public.villa_price_periods (property_id, period_start, period_end);

COMMENT ON TABLE public.villa_price_periods IS
  'Admin-defined custom nightly (or stay) prices for date ranges such as holidays or occasions.';

ALTER TABLE public.villa_price_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price periods"
  ON public.villa_price_periods FOR SELECT USING (true);

CREATE POLICY "Admins can insert price periods"
  ON public.villa_price_periods FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update price periods"
  ON public.villa_price_periods FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can delete price periods"
  ON public.villa_price_periods FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  ));
