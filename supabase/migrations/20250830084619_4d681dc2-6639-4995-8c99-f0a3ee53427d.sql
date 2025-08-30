-- CRITICAL SECURITY FIXES - Phase 1: Essential Structure
-- Breaking into smaller migrations to avoid deadlocks

-- =====================================================================
-- CREATE ESSENTIAL TABLES AND FUNCTIONS ONLY
-- =====================================================================

-- Create user roles table (essential for admin functions)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'therapist', 'admin')),
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create admin role check function  
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  );
$$;

-- Create secure therapist marketplace function (removes direct table access)
CREATE OR REPLACE FUNCTION public.get_secure_therapist_marketplace()
RETURNS TABLE(
  id uuid,
  full_name text,
  specializations text[],
  languages text[], 
  hourly_rate numeric,
  years_experience integer,
  bio text,
  timezone text,
  average_rating numeric,
  review_count bigint
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    t.id,
    t.full_name,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    t.bio,
    t.timezone,
    COALESCE(AVG(tr.rating), 0) as average_rating,
    COUNT(tr.id) as review_count
  FROM public.therapists t
  LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
  GROUP BY t.id, t.full_name, t.specializations, t.languages, 
           t.hourly_rate, t.years_experience, t.bio, t.timezone;
$$;

-- Enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_event_type text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_severity text DEFAULT 'info',
  p_source_ip inet DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type || ':' || p_severity,
    p_table_name,
    p_record_id,
    jsonb_build_object(
      'details', p_details,
      'severity', p_severity,
      'timestamp', now(),
      'source_ip', COALESCE(p_source_ip, inet_client_addr())
    ),
    COALESCE(p_source_ip, inet_client_addr()),
    NULL
  );
END;
$$;

-- Function to check for suspicious login patterns
CREATE OR REPLACE FUNCTION public.detect_suspicious_login(
  p_ip inet,
  p_email text,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_attempts integer;
  different_ips integer; 
  result jsonb;
BEGIN
  -- Count recent failed attempts from this IP (bypasses RLS)
  SELECT COUNT(*) INTO recent_attempts
  FROM public.auth_rate_limits 
  WHERE ip_address = p_ip 
    AND last_attempt_at > now() - interval '1 hour';
  
  -- Count different IPs trying this email recently
  SELECT COUNT(DISTINCT ip_address) INTO different_ips
  FROM public.auth_rate_limits
  WHERE email = p_email
    AND last_attempt_at > now() - interval '24 hours';
  
  result := jsonb_build_object(
    'recent_attempts', recent_attempts,
    'different_ips', different_ips,
    'suspicious', (recent_attempts > 3 OR different_ips > 5),
    'risk_level', CASE 
      WHEN recent_attempts > 10 OR different_ips > 10 THEN 'high'
      WHEN recent_attempts > 5 OR different_ips > 7 THEN 'medium'  
      ELSE 'low'
    END
  );
  
  RETURN result;
END;
$$;

-- Enhance rate limiting table with security tracking
ALTER TABLE public.auth_rate_limits 
ADD COLUMN IF NOT EXISTS severity_level text DEFAULT 'low',
ADD COLUMN IF NOT EXISTS geographic_region text,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS device_fingerprint text;

-- Log completion of Phase 1
SELECT public.log_security_event_enhanced(
  NULL,
  'security_phase_1_complete', 
  'system',
  NULL,
  jsonb_build_object(
    'migration', 'security_fixes_phase_1',
    'timestamp', now(),
    'functions_created', ARRAY['is_system_admin', 'get_secure_therapist_marketplace', 'detect_suspicious_login']
  ),
  'critical'
);