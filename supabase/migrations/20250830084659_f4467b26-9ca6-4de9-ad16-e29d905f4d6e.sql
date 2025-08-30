-- CRITICAL SECURITY FIXES - Phase 2: Lock Down Data Access & Fix Security Warnings
-- Addresses RLS policies and function search path security issues

-- =====================================================================
-- FIX FUNCTION SECURITY WARNINGS (SEARCH PATH)
-- =====================================================================

-- Fix search path for admin check function
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  );
$$;

-- Fix search path for therapist marketplace function  
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
SET search_path TO 'public'
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

-- Fix search path for suspicious login detection
CREATE OR REPLACE FUNCTION public.detect_suspicious_login(
  p_ip inet,
  p_email text,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- =====================================================================
-- CRITICAL DATA EXPOSURE FIXES - LOCK DOWN SENSITIVE TABLES
-- =====================================================================

-- 1. SECURE THERAPIST DATA (contains PII and license info)
DROP POLICY IF EXISTS "Therapists own data only" ON public.therapists;

CREATE POLICY "Therapists strict self access only"
ON public.therapists
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. SECURE SAFETY NETWORKS (emergency contact PII)  
DROP POLICY IF EXISTS "Users can delete own safety networks only" ON public.safety_networks;
DROP POLICY IF EXISTS "Users can insert own safety networks only" ON public.safety_networks;  
DROP POLICY IF EXISTS "Users can update own safety networks only" ON public.safety_networks;
DROP POLICY IF EXISTS "Users can view own safety networks only" ON public.safety_networks;

CREATE POLICY "Safety networks user access only"
ON public.safety_networks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. COMPLETELY LOCK DOWN AUDIT LOGS (system security data)
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Audit logs admin read only"
ON public.audit_logs
FOR SELECT
USING (public.is_system_admin());

CREATE POLICY "Block all audit log modifications"
ON public.audit_logs
FOR ALL
USING (false)
WITH CHECK (false);

-- 4. SECURE PAYMENT ANALYTICS (business financial data)
DROP POLICY IF EXISTS "admin_only_analytics" ON public.payment_analytics;

CREATE POLICY "Payment analytics admin only"
ON public.payment_analytics  
FOR SELECT
USING (public.is_system_admin());

CREATE POLICY "Block payment analytics modifications"
ON public.payment_analytics
FOR ALL
USING (false) 
WITH CHECK (false);

-- 5. LOCK DOWN RATE LIMITING TABLE (security system data)
DROP POLICY IF EXISTS "System only rate limits" ON public.auth_rate_limits;

CREATE POLICY "Rate limits no user access"
ON public.auth_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- =====================================================================
-- SECURE NEW TABLES
-- =====================================================================

-- User roles table policies
CREATE POLICY "Users view own roles only"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all user roles"  
ON public.user_roles
FOR ALL
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Log completion of Phase 2
SELECT public.log_security_event_enhanced(
  NULL,
  'security_phase_2_complete', 
  'system',
  NULL,
  jsonb_build_object(
    'migration', 'security_fixes_phase_2',
    'timestamp', now(),
    'tables_secured', ARRAY['therapists', 'safety_networks', 'audit_logs', 'payment_analytics', 'auth_rate_limits'],
    'search_path_fixes_applied', true
  ),
  'critical'
);