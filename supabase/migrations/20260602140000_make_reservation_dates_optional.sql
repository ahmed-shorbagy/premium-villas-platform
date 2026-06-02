-- Make dates and price optional in reservations since the UI form will no longer require them
ALTER TABLE public.reservations ALTER COLUMN check_in DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN check_out DROP NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN total_price DROP NOT NULL;
