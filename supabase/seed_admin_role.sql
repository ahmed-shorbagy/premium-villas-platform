-- Run in SQL Editor AFTER creating the user in Dashboard → Authentication → Add user
-- Email: admin@admin.com  |  Password: 123456  |  Auto Confirm: ON
--
-- Or use: npm run admin:create (with SUPABASE_SERVICE_ROLE_KEY in .env)

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'admin@admin.com'
ON CONFLICT (user_id, role) DO NOTHING;
