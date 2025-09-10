-- Security fixes: Restrict public content access and add security logging (corrected)

-- Create function to log content access attempts
CREATE OR REPLACE FUNCTION public.log_content_access_attempt(
  p_table_name text,
  p_access_type text,
  p_user_authenticated boolean DEFAULT false,
  p_context text DEFAULT 'content_access'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log content access attempts for security monitoring
  PERFORM public.log_security_event_v2(
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'content_access_attempt',
    CASE 
      WHEN NOT p_user_authenticated THEN 'high'
      ELSE 'low'
    END,
    p_table_name,
    null,
    jsonb_build_object(
      'access_type', p_access_type,
      'table_name', p_table_name,
      'user_authenticated', p_user_authenticated,
      'context', p_context,
      'timestamp', now()
    ),
    CASE 
      WHEN NOT p_user_authenticated THEN 75
      ELSE 25
    END
  );
END;
$$;

-- Update achievements table policies - require authentication
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON public.achievements;
CREATE POLICY "Authenticated users can view achievements" 
ON public.achievements 
FOR SELECT 
TO authenticated
USING (
  (SELECT public.log_content_access_attempt('achievements', 'select', true)) IS NULL
  AND true
);

-- Update exercises table policies - require authentication
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON public.exercises;
CREATE POLICY "Authenticated users can view exercises" 
ON public.exercises 
FOR SELECT 
TO authenticated
USING (
  (SELECT public.log_content_access_attempt('exercises', 'select', true)) IS NULL
  AND true
);

-- Update ai_avatars table policies - require authentication
DROP POLICY IF EXISTS "AI avatars are viewable by everyone" ON public.ai_avatars;
CREATE POLICY "Authenticated users can view AI avatars" 
ON public.ai_avatars 
FOR SELECT 
TO authenticated
USING (
  (SELECT public.log_content_access_attempt('ai_avatars', 'select', true)) IS NULL
  AND true
);

-- Update group_therapy_sessions table policies - require authentication
DROP POLICY IF EXISTS "Anyone can view group therapy sessions" ON public.group_therapy_sessions;
CREATE POLICY "Authenticated users can view group therapy sessions" 
ON public.group_therapy_sessions 
FOR SELECT 
TO authenticated
USING (
  (SELECT public.log_content_access_attempt('group_therapy_sessions', 'select', true)) IS NULL
  AND true
);

-- Update group_vr_sessions table policies - require authentication
DROP POLICY IF EXISTS "Group VR sessions are viewable by everyone" ON public.group_vr_sessions;
CREATE POLICY "Authenticated users can view group VR sessions" 
ON public.group_vr_sessions 
FOR SELECT 
TO authenticated
USING (
  (SELECT public.log_content_access_attempt('group_vr_sessions', 'select', true)) IS NULL
  AND true
);

-- Update group_vr_participants table policies - be more restrictive
DROP POLICY IF EXISTS "Users can view group participants" ON public.group_vr_participants;
CREATE POLICY "Authenticated users can view group VR participants in their sessions" 
ON public.group_vr_participants 
FOR SELECT 
TO authenticated
USING (
  (SELECT public.log_content_access_attempt('group_vr_participants', 'select', true)) IS NULL
  AND (
    auth.uid() = user_id 
    OR session_id IN (
      SELECT session_id FROM public.group_vr_participants 
      WHERE user_id = auth.uid()
    )
  )
);

-- Add rate limiting for content access
CREATE TABLE IF NOT EXISTS public.content_access_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  table_name text NOT NULL,
  access_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, table_name, window_start)
);

-- Enable RLS on content access limits
ALTER TABLE public.content_access_limits ENABLE ROW LEVEL SECURITY;

-- Policy for content access limits - users can only see their own
CREATE POLICY "Users can view their own access limits" 
ON public.content_access_limits 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to check content access rate limits
CREATE OR REPLACE FUNCTION public.check_content_access_rate_limit(
  p_table_name text,
  p_max_requests integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (p_window_minutes || ' minutes')::interval;
  
  -- Get current access count for this user and table in the time window
  SELECT COALESCE(SUM(access_count), 0) INTO current_count
  FROM public.content_access_limits
  WHERE user_id = auth.uid()
    AND table_name = p_table_name
    AND window_start >= window_start_time;
  
  -- If over limit, log security event and return false
  IF current_count >= p_max_requests THEN
    PERFORM public.log_security_event_v2(
      auth.uid(),
      'content_access_rate_limit_exceeded',
      'high',
      p_table_name,
      null,
      jsonb_build_object(
        'table_name', p_table_name,
        'current_count', current_count,
        'max_requests', p_max_requests,
        'window_minutes', p_window_minutes
      ),
      80
    );
    RETURN false;
  END IF;
  
  -- Update or insert access count
  INSERT INTO public.content_access_limits (user_id, table_name, access_count, window_start)
  VALUES (auth.uid(), p_table_name, 1, date_trunc('hour', now()))
  ON CONFLICT (user_id, table_name, window_start) 
  DO UPDATE SET access_count = content_access_limits.access_count + 1;
  
  RETURN true;
END;
$$;

-- Create enhanced audit function for data modifications
CREATE OR REPLACE FUNCTION public.audit_sensitive_modifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log modifications to sensitive tables
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    PERFORM public.log_security_event_v2(
      auth.uid(),
      'sensitive_data_modification',
      CASE 
        WHEN TG_OP = 'DELETE' THEN 'high'
        WHEN TG_OP = 'UPDATE' THEN 'medium'
        ELSE 'low'
      END,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'timestamp', now(),
        'user_id', auth.uid()
      ),
      CASE 
        WHEN TG_OP = 'DELETE' THEN 70
        WHEN TG_OP = 'UPDATE' THEN 50
        ELSE 30
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add modification audit triggers to sensitive tables
CREATE TRIGGER audit_profiles_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_modifications();

CREATE TRIGGER audit_safety_networks_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.safety_networks
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_modifications();

CREATE TRIGGER audit_therapists_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_modifications();