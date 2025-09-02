-- **CRITICAL SECURITY FIXES - PHASE 1**

-- 1. CREATE SECURITY DEFINER FUNCTIONS TO BREAK RLS RECURSION
CREATE OR REPLACE FUNCTION public.get_user_group_memberships(p_user_id uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gm.group_id 
  FROM public.group_members gm
  WHERE gm.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_user_id uuid, p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.user_id = p_user_id AND gm.group_id = p_group_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_therapy_participant(p_user_id uuid, p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_therapy_participants gtp
    WHERE gtp.user_id = p_user_id AND gtp.session_id = p_session_id
  );
$$;

-- 2. FIX INFINITE RECURSION IN RLS POLICIES
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.community_groups;
DROP POLICY IF EXISTS "Group members can view group details" ON public.group_members;
DROP POLICY IF EXISTS "Group therapy participants access" ON public.group_therapy_participants;

-- Create safe RLS policies using security definer functions
CREATE POLICY "Users can view groups they belong to"
ON public.community_groups
FOR SELECT
USING (
  id IN (SELECT group_id FROM public.get_user_group_memberships(auth.uid()))
  OR created_by = auth.uid()
);

CREATE POLICY "Group members can view membership"
ON public.group_members
FOR SELECT
USING (
  user_id = auth.uid() 
  OR group_id IN (SELECT group_id FROM public.get_user_group_memberships(auth.uid()))
);

CREATE POLICY "Group members can insert themselves"
ON public.group_members
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Group therapy participants can view their sessions"
ON public.group_therapy_participants
FOR SELECT
USING (user_id = auth.uid());

-- 3. STRENGTHEN THERAPIST DATA ACCESS CONTROLS
-- Create secure therapist marketplace function (PII-free)
CREATE OR REPLACE FUNCTION public.get_secure_therapist_marketplace_v2()
RETURNS TABLE(
  id uuid,
  full_name text,
  specializations text[],
  languages text[],
  hourly_rate numeric,
  years_experience integer,
  bio text,
  timezone text,
  availability jsonb,
  average_rating numeric,
  review_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id,
    t.full_name,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    CASE 
      -- Only show bio if user is authenticated and has an appointment with this therapist
      WHEN auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.appointments a 
        WHERE a.therapist_id = t.id AND a.client_id = auth.uid()
      ) THEN t.bio
      ELSE SUBSTRING(t.bio, 1, 100) || '...'
    END as bio,
    t.timezone,
    t.availability,
    COALESCE(AVG(tr.rating), 0) as average_rating,
    COUNT(tr.id) as review_count
  FROM public.therapists t
  LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true AND t.is_verified = true
  GROUP BY t.id, t.full_name, t.specializations, t.languages, 
           t.hourly_rate, t.years_experience, t.bio, t.timezone, t.availability;
$$;

-- 4. ENHANCED AUDIT LOGGING SYSTEM
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  severity_level text NOT NULL DEFAULT 'info',
  table_name text,
  record_id uuid,
  event_details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  session_id text,
  risk_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only system admins can view security events
CREATE POLICY "Security events admin only"
ON public.security_events
FOR SELECT
USING (is_system_admin());

-- Block all modifications to security events
CREATE POLICY "Block security events modifications"
ON public.security_events
FOR ALL
USING (false)
WITH CHECK (false);

-- 5. ENHANCED SECURITY EVENT LOGGING FUNCTION
CREATE OR REPLACE FUNCTION public.log_security_event_v2(
  p_user_id uuid,
  p_event_type text,
  p_severity_level text DEFAULT 'info',
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_event_details jsonb DEFAULT '{}',
  p_risk_score integer DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity_level,
    table_name,
    record_id,
    event_details,
    ip_address,
    risk_score
  ) VALUES (
    p_user_id,
    p_event_type,
    p_severity_level,
    p_table_name,
    p_record_id,
    p_event_details,
    inet_client_addr(),
    p_risk_score
  );
  
  -- Alert on high-risk events
  IF p_risk_score > 75 OR p_severity_level = 'critical' THEN
    -- Log to audit_logs for immediate attention
    PERFORM public.log_security_event_enhanced(
      p_user_id,
      'high_risk_security_event',
      COALESCE(p_table_name, 'security_events'),
      p_record_id,
      p_event_details,
      'critical'
    );
  END IF;
END;
$$;

-- 6. ENHANCED DATA ACCESS TRIGGERS
CREATE OR REPLACE FUNCTION public.audit_sensitive_data_access_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_score integer := 0;
  event_details jsonb;
BEGIN
  -- Calculate risk score based on table and operation
  IF TG_TABLE_NAME IN ('therapists', 'appointments', 'safety_networks') THEN
    risk_score := 60;
  ELSIF TG_TABLE_NAME IN ('profiles', 'conversations', 'mood_entries') THEN
    risk_score := 40;
  ELSE
    risk_score := 20;
  END IF;
  
  -- Higher risk for DELETE operations
  IF TG_OP = 'DELETE' THEN
    risk_score := risk_score + 30;
  END IF;
  
  event_details := jsonb_build_object(
    'operation', TG_OP,
    'table_name', TG_TABLE_NAME,
    'timestamp', now(),
    'record_id', COALESCE(NEW.id, OLD.id)
  );
  
  -- Log security event
  PERFORM public.log_security_event_v2(
    auth.uid(),
    'sensitive_data_access',
    CASE 
      WHEN risk_score > 70 THEN 'high'
      WHEN risk_score > 40 THEN 'medium'
      ELSE 'low'
    END,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    event_details,
    risk_score
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_therapists_access ON public.therapists;
CREATE TRIGGER audit_therapists_access
  AFTER INSERT OR UPDATE OR DELETE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_access_v2();

DROP TRIGGER IF EXISTS audit_profiles_access ON public.profiles;
CREATE TRIGGER audit_profiles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_access_v2();

DROP TRIGGER IF EXISTS audit_safety_networks_access ON public.safety_networks;
CREATE TRIGGER audit_safety_networks_access
  AFTER INSERT OR UPDATE OR DELETE ON public.safety_networks
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_data_access_v2();

-- 7. ENHANCED PASSWORD SECURITY TABLE
CREATE TABLE IF NOT EXISTS public.password_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL, -- 'weak_password', 'leaked_password', 'failed_attempt'
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.password_security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own password events"
ON public.password_security_events
FOR SELECT
USING (auth.uid() = user_id OR is_system_admin());

-- 8. CONTENT MODERATION ENHANCEMENTS
CREATE OR REPLACE FUNCTION public.enhanced_content_moderation(content_text text, content_type text DEFAULT 'post')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  flagged_terms text[] := ARRAY[
    'spam', 'abuse', 'harassment', 'threat', 'violence', 'self-harm', 
    'suicide', 'kill myself', 'end it all', 'not worth living',
    'scam', 'phishing', 'malware', 'virus'
  ];
  crisis_terms text[] := ARRAY[
    'suicide', 'kill myself', 'end it all', 'not worth living',
    'self-harm', 'hurt myself', 'want to die', 'no point living'
  ];
  result jsonb := '{}'::jsonb;
  term text;
  content_lower text := lower(content_text);
  risk_score integer := 0;
  is_crisis boolean := false;
BEGIN
  result := jsonb_build_object(
    'flagged', false, 
    'reasons', '[]'::jsonb,
    'risk_score', 0,
    'crisis_detected', false,
    'requires_review', false
  );
  
  -- Check for flagged terms
  FOREACH term IN ARRAY flagged_terms
  LOOP
    IF content_lower LIKE '%' || term || '%' THEN
      result := jsonb_set(result, '{flagged}', 'true'::jsonb);
      result := jsonb_set(
        result, 
        '{reasons}', 
        (result->'reasons') || jsonb_build_array(term)
      );
      risk_score := risk_score + 20;
    END IF;
  END LOOP;
  
  -- Check for crisis indicators
  FOREACH term IN ARRAY crisis_terms
  LOOP
    IF content_lower LIKE '%' || term || '%' THEN
      is_crisis := true;
      risk_score := risk_score + 50;
      result := jsonb_set(result, '{crisis_detected}', 'true'::jsonb);
      
      -- Log crisis detection immediately
      PERFORM public.log_security_event_v2(
        auth.uid(),
        'crisis_content_detected',
        'critical',
        'content_moderation',
        null,
        jsonb_build_object(
          'content_type', content_type,
          'detected_term', term,
          'content_length', length(content_text)
        ),
        90
      );
    END IF;
  END LOOP;
  
  -- Set risk score and review requirements
  result := jsonb_set(result, '{risk_score}', to_jsonb(risk_score));
  result := jsonb_set(result, '{requires_review}', to_jsonb(risk_score > 40));
  
  RETURN result;
END;
$$;

-- 9. MENTAL HEALTH DATA PROTECTION
-- Add encryption fields for sensitive mental health data
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS encrypted_content text,
ADD COLUMN IF NOT EXISTS encryption_key_id text;

ALTER TABLE public.mood_entries
ADD COLUMN IF NOT EXISTS encrypted_notes text,
ADD COLUMN IF NOT EXISTS encryption_key_id text;

-- 10. EMERGENCY CONTACT PROTECTION
ALTER TABLE public.safety_networks
ADD COLUMN IF NOT EXISTS encrypted_phone text,
ADD COLUMN IF NOT EXISTS encrypted_email text,
ADD COLUMN IF NOT EXISTS encryption_key_id text;