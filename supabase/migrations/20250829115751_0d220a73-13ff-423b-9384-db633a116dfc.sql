-- CRITICAL SECURITY FIXES MIGRATION (Fixed Syntax)
-- This migration addresses all critical security vulnerabilities identified in the security review

-- =====================================================================
-- PHASE 1: CREATE REQUIRED TABLES FIRST
-- =====================================================================

-- Create user roles table first (needed for admin functions)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'therapist', 'admin')),
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security metrics tracking table
CREATE TABLE IF NOT EXISTS public.security_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date DEFAULT CURRENT_DATE,
  failed_logins integer DEFAULT 0,
  suspicious_activities integer DEFAULT 0, 
  data_access_attempts integer DEFAULT 0,
  policy_violations integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(metric_date)
);

ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- PHASE 2: CREATE SECURITY FUNCTIONS 
-- =====================================================================

-- Create admin role check function (now that user_roles table exists)
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

-- Enhanced security event logging function
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

-- =====================================================================
-- PHASE 3: CRITICAL DATA EXPOSURE FIXES
-- =====================================================================

-- 1. COMPLETELY LOCK DOWN THERAPIST DATA ACCESS
DROP POLICY IF EXISTS "Therapists own data only" ON public.therapists;

CREATE POLICY "Therapists can only access their own profile"
ON public.therapists
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. SECURE SAFETY NETWORKS (EMERGENCY CONTACTS)
DROP POLICY IF EXISTS "Users can delete own safety networks only" ON public.safety_networks;
DROP POLICY IF EXISTS "Users can insert own safety networks only" ON public.safety_networks;  
DROP POLICY IF EXISTS "Users can update own safety networks only" ON public.safety_networks;
DROP POLICY IF EXISTS "Users can view own safety networks only" ON public.safety_networks;

CREATE POLICY "Users own safety networks strict access"
ON public.safety_networks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. COMPLETELY SECURE AUDIT LOGS 
DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.audit_logs;

CREATE POLICY "System admins only audit access"
ON public.audit_logs
FOR SELECT
USING (public.is_system_admin());

-- Block all modifications to audit logs (system only)
CREATE POLICY "Block audit log modifications"
ON public.audit_logs
FOR ALL
USING (false)
WITH CHECK (false);

-- 4. SECURE PAYMENT ANALYTICS
DROP POLICY IF EXISTS "admin_only_analytics" ON public.payment_analytics;

CREATE POLICY "Admin only payment analytics"
ON public.payment_analytics  
FOR SELECT
USING (public.is_system_admin());

-- Block modifications to payment analytics (system only)
CREATE POLICY "Block payment analytics modifications"
ON public.payment_analytics
FOR ALL
USING (false) 
WITH CHECK (false);

-- 5. SECURE RATE LIMITING TABLE
DROP POLICY IF EXISTS "System only rate limits" ON public.auth_rate_limits;

CREATE POLICY "Rate limits system access only"
ON public.auth_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- =====================================================================
-- PHASE 4: SECURE TABLE POLICIES
-- =====================================================================

-- User roles policies (now that functions exist)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"  
ON public.user_roles
FOR ALL
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());

-- Security metrics policies  
CREATE POLICY "Admins only security metrics"
ON public.security_metrics  
FOR SELECT
USING (public.is_system_admin());

-- Block modifications to security metrics (system only)
CREATE POLICY "Block security metrics modifications"
ON public.security_metrics
FOR ALL
USING (false)
WITH CHECK (false);

-- =====================================================================
-- PHASE 5: SECURE DATA ACCESS FUNCTIONS
-- =====================================================================

-- Create secure therapist marketplace function
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

-- =====================================================================
-- PHASE 6: ENHANCED AUTHENTICATION SECURITY
-- =====================================================================

-- Strengthen rate limiting with enhanced tracking
ALTER TABLE public.auth_rate_limits 
ADD COLUMN IF NOT EXISTS severity_level text DEFAULT 'low',
ADD COLUMN IF NOT EXISTS geographic_region text,
ADD COLUMN IF NOT EXISTS user_agent text,
ADD COLUMN IF NOT EXISTS device_fingerprint text;

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
  -- Count recent failed attempts from this IP (bypasses RLS by using security definer)
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

-- Function to hash sensitive data (for PII protection)
CREATE OR REPLACE FUNCTION public.hash_sensitive_data(data text)
RETURNS text
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT encode(digest(data, 'sha256'), 'hex');
$$;

-- =====================================================================
-- PHASE 7: LOG COMPLETION
-- =====================================================================

-- Log this critical security update
SELECT public.log_security_event_enhanced(
  NULL,
  'security_hardening_complete', 
  'system',
  NULL,
  jsonb_build_object(
    'migration', 'comprehensive_security_fixes_v3',
    'timestamp', now(),
    'critical_fixes_applied', true,
    'tables_secured', ARRAY['therapists', 'safety_networks', 'audit_logs', 'payment_analytics', 'auth_rate_limits'],
    'functions_created', ARRAY['is_system_admin', 'get_secure_therapist_marketplace', 'detect_suspicious_login']
  ),
  'critical'
);