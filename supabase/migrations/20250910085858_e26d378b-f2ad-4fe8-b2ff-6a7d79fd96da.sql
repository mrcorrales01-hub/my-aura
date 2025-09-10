-- Security Fix 1: Enhance RLS policies for content tables
-- Remove overly permissive policies and add authentication requirements

-- Update content access policies to require authentication
DROP POLICY IF EXISTS "Public content viewable by everyone" ON public.exercises;
DROP POLICY IF EXISTS "Public AI avatars viewable by everyone" ON public.ai_avatars;
DROP POLICY IF EXISTS "Public group therapy sessions viewable by everyone" ON public.group_therapy_sessions;
DROP POLICY IF EXISTS "Public group VR sessions viewable by everyone" ON public.group_vr_sessions;

-- Create more restrictive policies for exercises
CREATE POLICY "Authenticated users can view exercises with rate limiting" 
ON public.exercises 
FOR SELECT 
USING (
  (SELECT check_content_access_rate_limit('exercises', 50, 60)) AND
  (SELECT log_content_access_attempt('exercises', 'select', true)) IS NULL AND
  auth.uid() IS NOT NULL
);

-- Create more restrictive policies for AI avatars
CREATE POLICY "Authenticated users can view AI avatars with monitoring" 
ON public.ai_avatars 
FOR SELECT 
USING (
  (SELECT log_content_access_attempt('ai_avatars', 'select', true)) IS NULL AND
  auth.uid() IS NOT NULL
);

-- Update group therapy sessions to require authentication
CREATE POLICY "Authenticated users can view group therapy sessions with logging" 
ON public.group_therapy_sessions 
FOR SELECT 
USING (
  (SELECT log_content_access_attempt('group_therapy_sessions', 'select', true)) IS NULL AND
  auth.uid() IS NOT NULL
);

-- Update group VR sessions to require authentication
CREATE POLICY "Authenticated users can view group VR sessions with logging" 
ON public.group_vr_sessions 
FOR SELECT 
USING (
  (SELECT log_content_access_attempt('group_vr_sessions', 'select', true)) IS NULL AND
  auth.uid() IS NOT NULL
);

-- Security Fix 2: Enhanced crisis detection and monitoring
CREATE OR REPLACE FUNCTION public.monitor_high_risk_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Alert on patterns of high-risk events
  PERFORM public.log_security_event_v2(
    '00000000-0000-0000-0000-000000000000'::uuid,
    'security_monitoring_check',
    'info',
    'security_events',
    null,
    jsonb_build_object(
      'high_risk_events_last_hour', (
        SELECT COUNT(*) FROM public.security_events 
        WHERE created_at > now() - interval '1 hour' 
        AND risk_score > 75
      ),
      'unique_users_with_high_risk', (
        SELECT COUNT(DISTINCT user_id) FROM public.security_events 
        WHERE created_at > now() - interval '24 hours' 
        AND risk_score > 75
      )
    ),
    10
  );
END;
$$;

-- Security Fix 3: Enhanced content validation with automatic escalation
CREATE OR REPLACE FUNCTION public.auto_escalate_critical_content()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
DECLARE
  moderation_result jsonb;
  crisis_result jsonb;
BEGIN
  -- Enhanced content moderation for posts and comments
  IF TG_TABLE_NAME IN ('community_posts', 'community_comments') THEN
    moderation_result := public.enhanced_content_moderation(NEW.content, TG_TABLE_NAME);
    crisis_result := public.enhanced_crisis_detection(NEW.content, 'community');
    
    -- Auto-flag high-risk content
    IF (moderation_result->>'risk_score')::integer > 60 OR (crisis_result->>'severity_score')::integer > 40 THEN
      NEW.moderation_status := 'requires_review';
      NEW.moderation_flags := jsonb_build_array(
        jsonb_build_object(
          'type', 'auto_escalated',
          'reason', 'high_risk_content',
          'moderation_score', moderation_result->>'risk_score',
          'crisis_score', crisis_result->>'severity_score',
          'timestamp', now()
        )
      );
    END IF;
    
    -- Immediate block for critical content
    IF (crisis_result->>'severity_score')::integer > 70 THEN
      NEW.moderation_status := 'blocked';
      
      -- Log critical incident
      PERFORM public.log_security_event_v2(
        NEW.user_id,
        'critical_content_auto_blocked',
        'critical',
        TG_TABLE_NAME,
        NEW.id,
        jsonb_build_object(
          'content_preview', LEFT(NEW.content, 100),
          'crisis_score', crisis_result->>'severity_score',
          'detected_terms', crisis_result->'detected_terms'
        ),
        95
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger to community content
DROP TRIGGER IF EXISTS auto_escalate_content_trigger ON public.community_posts;
CREATE TRIGGER auto_escalate_content_trigger
  BEFORE INSERT OR UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_escalate_critical_content();

DROP TRIGGER IF EXISTS auto_escalate_content_trigger ON public.community_comments;
CREATE TRIGGER auto_escalate_content_trigger
  BEFORE INSERT OR UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_escalate_critical_content();

-- Security Fix 4: Enhanced audit trail for profile access
CREATE OR REPLACE FUNCTION public.audit_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log all profile access attempts
  IF TG_OP = 'SELECT' THEN
    PERFORM public.log_profile_data_access(
      COALESCE(NEW.id, OLD.id),
      'profile_view',
      ARRAY['id', 'display_name', 'bio', 'avatar_url'],
      'profile_access'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Security Fix 5: Rate limiting for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_attempt_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL,
  email text,
  attempt_type text NOT NULL,
  success boolean DEFAULT false,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone
);

-- Enable RLS on auth tracking
ALTER TABLE public.auth_attempt_tracking ENABLE ROW LEVEL SECURITY;

-- Only allow system access to auth tracking
CREATE POLICY "System only access to auth tracking" 
ON public.auth_attempt_tracking 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Function to check and log auth attempts
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_email text,
  p_attempt_type text,
  p_success boolean DEFAULT false,
  p_user_agent text DEFAULT null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_ip inet := inet_client_addr();
  recent_failures integer;
  is_blocked boolean := false;
BEGIN
  -- Count recent failures from this IP
  SELECT COUNT(*) INTO recent_failures
  FROM public.auth_attempt_tracking
  WHERE ip_address = client_ip
    AND success = false
    AND created_at > now() - interval '1 hour';
  
  -- Check if IP should be blocked
  IF recent_failures >= 5 THEN
    is_blocked := true;
    
    -- Log security event for potential brute force
    PERFORM public.log_security_event_v2(
      null,
      'potential_brute_force_attack',
      'high',
      'auth_attempt_tracking',
      null,
      jsonb_build_object(
        'ip_address', client_ip::text,
        'email', p_email,
        'recent_failures', recent_failures,
        'attempt_type', p_attempt_type
      ),
      85
    );
  END IF;
  
  -- Log the attempt
  INSERT INTO public.auth_attempt_tracking (
    ip_address,
    email,
    attempt_type,
    success,
    user_agent,
    blocked_until
  ) VALUES (
    client_ip,
    p_email,
    p_attempt_type,
    p_success,
    p_user_agent,
    CASE WHEN is_blocked THEN now() + interval '1 hour' ELSE null END
  );
  
  RETURN NOT is_blocked;
END;
$$;