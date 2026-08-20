-- Soft-hide villas from public site without deleting them
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS properties_is_hidden_idx
  ON public.properties (is_hidden)
  WHERE is_hidden = false;
