-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'therapist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create security definer function to check if user has a specific role
-- This prevents RLS recursion issues when checking roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role::text
  )
$$;

-- Create convenience function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Create function to check if current user is system admin
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Fix ALL existing SECURITY DEFINER functions to set search_path
-- This prevents search_path injection attacks

-- Fix get_user_group_memberships
CREATE OR REPLACE FUNCTION public.get_user_group_memberships(p_user_id uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gm.group_id
  FROM public.group_members gm
  WHERE gm.user_id = p_user_id;
$$;

-- Fix is_group_member
CREATE OR REPLACE FUNCTION public.is_group_member(p_user_id uuid, p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE user_id = p_user_id AND group_id = p_group_id
  );
$$;

-- Update RLS policies on sensitive tables to use security definer functions
-- This ensures proper access control without client-side manipulation

-- Update audit_logs policies to use is_user_admin()
DROP POLICY IF EXISTS "Audit logs admin read only" ON public.audit_logs;
CREATE POLICY "Audit logs admin read only"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_user_admin() OR user_id = auth.uid());

-- Comment explaining the security improvements
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check user roles - prevents RLS recursion and client-side manipulation';
COMMENT ON FUNCTION public.is_user_admin IS 'Security definer function to check if current user is admin - use this instead of direct user_roles queries';
COMMENT ON FUNCTION public.is_system_admin IS 'Security definer function to check if current user is system admin';
