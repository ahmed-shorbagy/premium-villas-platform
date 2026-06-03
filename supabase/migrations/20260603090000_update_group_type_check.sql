-- Update group_type constraint to allow 'all'
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_group_type_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_group_type_check CHECK (group_type IN ('family', 'youth_male', 'women_only', 'all'));
