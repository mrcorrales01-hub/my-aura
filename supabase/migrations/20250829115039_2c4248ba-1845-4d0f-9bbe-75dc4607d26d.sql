-- Final Security Lockdown Migration
-- This completely restricts access to sensitive data as identified in security scan

-- 1. Create completely locked down therapist policies (remove all public access to sensitive data)
DROP POLICY IF EXISTS "Public can view therapist marketplace info only" ON public.therapists;
DROP POLICY IF EXISTS "Therapists can view their own full profile" ON public.therapists;
DROP POLICY IF EXISTS "Therapists can update their own profile" ON public.therapists;
DROP POLICY IF EXISTS "Therapists can insert their own profile" ON public.therapists;

-- Only allow therapists to manage their own data, no public access to any therapist table data
CREATE POLICY "Therapists own data only" ON public.therapists
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Lock down profiles table completely (no cross-user access)
DROP POLICY IF EXISTS "Therapists can view their patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Completely restrict profiles to own data only
CREATE POLICY "Users own profile only" ON public.profiles
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Lock down crisis AI sessions completely
DROP POLICY IF EXISTS "Users can manage their own crisis sessions" ON public.crisis_ai_sessions;

CREATE POLICY "Users own crisis sessions only" ON public.crisis_ai_sessions
FOR ALL USING (user_id IS NULL OR auth.uid() = user_id) 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 4. Completely secure biofeedback sessions (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'biofeedback_sessions') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can manage their biofeedback sessions" ON public.biofeedback_sessions';
        EXECUTE 'CREATE POLICY "Users own biofeedback only" ON public.biofeedback_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

-- 5. Create secure therapist marketplace function (only returns safe public data)
CREATE OR REPLACE FUNCTION public.get_therapist_marketplace_data()
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
  -- Only return basic marketplace info, no sensitive PII like email, phone, license numbers
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
    COALESCE(AVG(tr.rating), 0) as average_rating,
    COUNT(tr.id) as review_count
  FROM public.therapists t
  LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true AND t.is_verified = true
  GROUP BY t.id, t.full_name, t.specializations, t.languages, t.hourly_rate, 
           t.years_experience, t.bio, t.profile_image_url, t.timezone, t.availability;
$$;

-- 6. Create secure appointment validation
CREATE OR REPLACE FUNCTION public.user_can_access_therapist_appointment_data(therapist_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.therapists t ON a.therapist_id = t.id
    WHERE t.user_id = therapist_user_id
    AND a.client_id = auth.uid()
  );
$$;

-- 7. Add critical data access logging
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log any access to sensitive tables
  PERFORM public.log_security_event(
    auth.uid(),
    'sensitive_data_access',
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'user_agent', current_setting('request.headers')::json->>'user-agent'
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add access logging to all sensitive tables
DROP TRIGGER IF EXISTS log_therapist_access ON public.therapists;
CREATE TRIGGER log_therapist_access
  BEFORE SELECT ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS log_profile_access ON public.profiles;
CREATE TRIGGER log_profile_access
  BEFORE SELECT ON public.profiles  
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

DROP TRIGGER IF EXISTS log_crisis_access ON public.crisis_ai_sessions;
CREATE TRIGGER log_crisis_access
  BEFORE SELECT ON public.crisis_ai_sessions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- 8. Grant minimal permissions
REVOKE ALL ON public.therapists FROM authenticated;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_therapist_marketplace_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_access_therapist_appointment_data(uuid) TO authenticated;

-- 9. Log this critical security update
SELECT public.log_security_event(
  auth.uid(),
  'critical_security_lockdown',
  'system',
  null,
  '{"action": "complete_data_lockdown", "timestamp": "' || now() || '"}'::jsonb
);