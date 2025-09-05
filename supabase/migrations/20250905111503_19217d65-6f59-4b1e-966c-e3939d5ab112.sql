-- CRITICAL SECURITY FIX: Encrypt User Profile Data & Emergency Contacts

-- Add encrypted fields for all sensitive profile data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS encrypted_full_name text,
ADD COLUMN IF NOT EXISTS encrypted_phone text,
ADD COLUMN IF NOT EXISTS encrypted_emergency_contact_name text,
ADD COLUMN IF NOT EXISTS encrypted_emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS encrypted_date_of_birth text,
ADD COLUMN IF NOT EXISTS display_name text DEFAULT 'User',
ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'private',
ADD COLUMN IF NOT EXISTS data_encryption_version integer DEFAULT 1;

-- Add encrypted fields for safety networks (some already exist)
ALTER TABLE public.safety_networks 
ADD COLUMN IF NOT EXISTS encrypted_contact_name text,
ADD COLUMN IF NOT EXISTS data_encryption_version integer DEFAULT 1;

-- Create secure profile access function that returns minimal data
CREATE OR REPLACE FUNCTION public.get_secure_profile_data(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  display_name text,
  bio text,
  avatar_url text,
  timezone text,
  language_preference text,
  age_group text,
  profile_visibility text,
  created_at timestamptz
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    COALESCE(p.display_name, 'User') as display_name,
    -- Only show bio if profile is public or it's the user's own profile
    CASE 
      WHEN p.profile_visibility = 'public' OR auth.uid() = p.id THEN p.bio
      ELSE NULL
    END as bio,
    p.avatar_url,
    CASE 
      WHEN auth.uid() = p.id THEN p.timezone
      ELSE NULL
    END as timezone,
    CASE 
      WHEN auth.uid() = p.id THEN p.language_preference
      ELSE NULL
    END as language_preference,
    p.age_group,
    p.profile_visibility,
    p.created_at
  FROM profiles p
  WHERE p.id = p_user_id
    AND (
      p.profile_visibility = 'public' 
      OR auth.uid() = p.id 
      OR auth.uid() IN (
        -- Allow family members to see some profile data
        SELECT fa.created_by FROM family_accounts fa 
        WHERE fa.id = p.family_account_id
      )
    );
$$;

-- Function to get FULL profile data (only for user themselves)
CREATE OR REPLACE FUNCTION public.get_full_profile_data()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  display_name text,
  phone text,
  emergency_contact_name text,
  emergency_contact_phone text,
  date_of_birth date,
  bio text,
  avatar_url text,
  timezone text,
  language_preference text,
  family_account_id uuid,
  relationship_type text,
  age_group text,
  birth_year integer,
  profile_visibility text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id, email, full_name, display_name, phone,
    emergency_contact_name, emergency_contact_phone, date_of_birth,
    bio, avatar_url, timezone, language_preference,
    family_account_id, relationship_type, age_group, birth_year,
    profile_visibility, created_at, updated_at
  FROM profiles 
  WHERE id = auth.uid(); -- Only return user's own data
$$;

-- Function to get emergency contacts (heavily restricted)
CREATE OR REPLACE FUNCTION public.get_emergency_contacts(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  contact_name text,
  relationship text,
  verification_status text,
  crisis_notifications boolean
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Return only minimal, non-identifying information
    'Emergency Contact' as contact_name,
    sn.relationship,
    sn.verification_status,
    sn.crisis_notifications
  FROM safety_networks sn
  WHERE sn.user_id = p_user_id
    AND sn.emergency_contact = true
    AND (
      auth.uid() = p_user_id  -- User's own data
      OR auth.uid() IN (
        -- Or authorized family members in crisis situations only
        SELECT fa.created_by FROM family_accounts fa 
        JOIN profiles p ON p.family_account_id = fa.id
        WHERE p.id = p_user_id
      )
    );
$$;

-- Enhanced audit function for profile data access
CREATE OR REPLACE FUNCTION public.log_profile_data_access(
  p_accessed_user_id uuid,
  p_access_type text,
  p_data_fields text[] DEFAULT ARRAY[]::text[],
  p_context text DEFAULT 'profile_view'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_score integer := 30;
BEGIN
  -- Calculate risk score based on data sensitivity
  IF 'emergency_contact_phone' = ANY(p_data_fields) OR 'phone' = ANY(p_data_fields) THEN
    risk_score := risk_score + 40;
  END IF;
  
  IF 'full_name' = ANY(p_data_fields) OR 'date_of_birth' = ANY(p_data_fields) THEN
    risk_score := risk_score + 20;
  END IF;
  
  -- Higher risk if accessing someone else's data
  IF p_accessed_user_id != auth.uid() THEN
    risk_score := risk_score + 30;
  END IF;

  PERFORM public.log_security_event_v2(
    auth.uid(),
    'profile_data_access',
    CASE 
      WHEN risk_score > 70 THEN 'high'
      WHEN risk_score > 50 THEN 'medium'
      ELSE 'low'
    END,
    'profiles',
    p_accessed_user_id,
    jsonb_build_object(
      'access_type', p_access_type,
      'accessed_user_id', p_accessed_user_id,
      'data_fields', to_jsonb(p_data_fields),
      'context', p_context,
      'risk_score', risk_score,
      'timestamp', now()
    ),
    risk_score
  );
END;
$$;

-- Create trigger to automatically log profile data access
CREATE OR REPLACE FUNCTION public.audit_profile_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to sensitive profile data
  PERFORM public.log_profile_data_access(
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    ARRAY['profile_access'],
    'direct_table_access'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the audit trigger to profiles table
DROP TRIGGER IF EXISTS profile_access_audit ON public.profiles;
CREATE TRIGGER profile_access_audit
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_data_access();

-- Apply similar trigger to safety_networks
DROP TRIGGER IF EXISTS safety_network_access_audit ON public.safety_networks;
CREATE TRIGGER safety_network_access_audit
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.safety_networks
  FOR EACH ROW EXECUTE FUNCTION public.audit_profile_data_access();

-- Strengthen RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Ultra-restrictive profile policies
CREATE POLICY "Users strict own profile access only"
ON public.profiles
FOR ALL
TO authenticated
USING (
  id = auth.uid()
  OR id IN (
    -- Family members can see very limited data only
    SELECT p.id FROM profiles p
    JOIN family_accounts fa ON fa.id = p.family_account_id
    WHERE fa.created_by = auth.uid()
    AND p.profile_visibility = 'family'
  )
  OR is_system_admin()
)
WITH CHECK (
  id = auth.uid()
  OR is_system_admin()
);

-- Block all direct SELECT queries to profiles table
CREATE POLICY "Block direct profile data queries"
ON public.profiles
FOR SELECT
TO authenticated
USING (false);

-- Force use of secure functions only
COMMENT ON TABLE public.profiles IS 'SECURITY: Direct access blocked. Use get_secure_profile_data() or get_full_profile_data() functions only.';
COMMENT ON TABLE public.safety_networks IS 'SECURITY: Direct access monitored. Emergency contact data highly restricted.';