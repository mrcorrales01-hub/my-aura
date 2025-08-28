-- Security Fix Migration: Comprehensive Database Security Hardening
-- This migration implements critical security fixes identified in the security review

-- 1. Create secure therapist public view (Priority 1)
CREATE OR REPLACE VIEW public.therapist_public_view AS
SELECT 
  t.id,
  t.full_name,
  t.specializations,
  t.languages,
  t.hourly_rate,
  t.years_experience,
  t.bio,
  t.profile_image_url,
  t.timezone,
  t.availability,
  t.is_verified,
  t.is_active,
  -- Calculate average rating from reviews
  COALESCE(AVG(tr.rating), 0) as average_rating,
  COUNT(tr.id) as review_count
FROM public.therapists t
LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
WHERE t.is_active = true AND t.is_verified = true
GROUP BY t.id, t.full_name, t.specializations, t.languages, t.hourly_rate, 
         t.years_experience, t.bio, t.profile_image_url, t.timezone, 
         t.availability, t.is_verified, t.is_active;

-- 2. Drop overly permissive therapist RLS policy and create secure one
DROP POLICY IF EXISTS "Users can view active verified therapists (limited info)" ON public.therapists;

CREATE POLICY "Public can view therapist marketplace info only"
ON public.therapists FOR SELECT
USING (
  is_active = true 
  AND is_verified = true 
  AND auth.role() = 'authenticated'
);

-- 3. Create security definer function for safe therapist data access
CREATE OR REPLACE FUNCTION public.get_therapist_public_info(therapist_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  specializations text[],
  languages text[],
  hourly_rate numeric,
  years_experience integer,
  bio text,
  profile_image_url text,
  timezone text,
  availability jsonb,
  average_rating numeric,
  review_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tpv.id,
    tpv.full_name,
    tpv.specializations,
    tpv.languages,
    tpv.hourly_rate,
    tpv.years_experience,
    tpv.bio,
    tpv.profile_image_url,
    tpv.timezone,
    tpv.availability,
    tpv.average_rating,
    tpv.review_count
  FROM public.therapist_public_view tpv
  WHERE tpv.id = therapist_id;
$$;

-- 4. Enhanced audit logging function (Priority 5)
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    ip_address
  ) VALUES (
    p_user_id,
    p_event_type,
    p_table_name,
    p_record_id,
    p_details,
    inet_client_addr()
  );
END;
$$;

-- 5. Create rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  email text,
  attempt_type text NOT NULL, -- 'login', 'signup', 'password_reset'
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow system to manage rate limits
CREATE POLICY "System only rate limits" ON public.auth_rate_limits
FOR ALL USING (false);

-- 6. Create content moderation function for community safety
CREATE OR REPLACE FUNCTION public.moderate_content(content_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flagged_terms text[] := ARRAY['spam', 'abuse', 'harassment', 'threat'];
  result jsonb := '{}'::jsonb;
  term text;
  content_lower text := lower(content_text);
BEGIN
  result := jsonb_build_object('flagged', false, 'reasons', '[]'::jsonb);
  
  FOREACH term IN ARRAY flagged_terms
  LOOP
    IF content_lower LIKE '%' || term || '%' THEN
      result := jsonb_set(result, '{flagged}', 'true'::jsonb);
      result := jsonb_set(
        result, 
        '{reasons}', 
        (result->'reasons') || jsonb_build_array(term)
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- 7. Enhance safety networks RLS policy
DROP POLICY IF EXISTS "Users can manage their own safety networks" ON public.safety_networks;

CREATE POLICY "Users can view own safety networks only"
ON public.safety_networks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own safety networks only"
ON public.safety_networks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own safety networks only"  
ON public.safety_networks FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own safety networks only"
ON public.safety_networks FOR DELETE
USING (auth.uid() = user_id);

-- 8. Create secure appointment access function
CREATE OR REPLACE FUNCTION public.can_access_appointment(appointment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id
    AND (
      a.client_id = auth.uid() 
      OR a.therapist_id IN (
        SELECT t.id FROM public.therapists t WHERE t.user_id = auth.uid()
      )
    )
  );
$$;

-- 9. Add indexes for security performance
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_ip_type ON public.auth_rate_limits(ip_address, attempt_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_therapist_security ON public.therapists(is_active, is_verified) WHERE is_active = true AND is_verified = true;

-- 10. Create session security function
CREATE OR REPLACE FUNCTION public.validate_session_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive data access
  IF TG_TABLE_NAME IN ('profiles', 'therapists', 'safety_networks') THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'data_access',
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object('operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add security triggers to sensitive tables
DROP TRIGGER IF EXISTS security_audit_profiles ON public.profiles;
CREATE TRIGGER security_audit_profiles
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_session_security();

DROP TRIGGER IF EXISTS security_audit_therapists ON public.therapists;  
CREATE TRIGGER security_audit_therapists
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.validate_session_security();

-- Grant appropriate permissions
GRANT SELECT ON public.therapist_public_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_therapist_public_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.moderate_content(text) TO authenticated;

-- Log this security migration
SELECT public.log_security_event(
  auth.uid(),
  'security_migration_applied',
  'system',
  null,
  '{"migration": "comprehensive_security_hardening", "timestamp": "' || now() || '"}'::jsonb
);