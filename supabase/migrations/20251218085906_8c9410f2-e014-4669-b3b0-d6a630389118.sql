-- Add RLS policy for user_roles - only admins can view roles
CREATE POLICY "Admins can view user roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Users can see their own role
CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());