-- Update properties type check constraint to include 'land'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;

ALTER TABLE public.properties
ADD CONSTRAINT properties_type_check 
CHECK (type IN ('apartment', 'villa', 'commercial', 'duplex', 'office', 'land'));
