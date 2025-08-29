-- Final Security Lockdown Migration (Fixed)
-- This completely restricts access to sensitive data without invalid SELECT triggers

-- 1. Create completely locked down therapist policies
DROP POLICY IF EXISTS "Public can view therapist marketplace info only" ON public.therapists;
DROP POLICY IF EXISTS "Therapists can view their own full profile" ON public.therapists;
DROP POLICY IF EXISTS "Therapists can update their own profile" ON public.therapists;  
DROP POLICY IF EXISTS "Therapists can insert their own profile" ON public.therapists;

-- Only allow therapists to manage their own data
CREATE POLICY "Therapists own data only" ON public.therapists
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Lock down profiles table completely
DROP POLICY IF EXISTS "Therapists can view their patient profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Completely restrict profiles to own data only
CREATE POLICY "Users own profile only" ON public.profiles
FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 3. Lock down crisis AI sessions
DROP POLICY IF EXISTS "Users can manage their own crisis sessions" ON public.crisis_ai_sessions;

CREATE POLICY "Users own crisis sessions only" ON public.crisis_ai_sessions
FOR ALL USING (user_id IS NULL OR auth.uid() = user_id) 
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 4. Secure biofeedback sessions if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'biofeedback_sessions') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can manage their biofeedback sessions" ON public.biofeedback_sessions';
        EXECUTE 'CREATE POLICY "Users own biofeedback only" ON public.biofeedback_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
END $$;

-- 5. Create secure therapist marketplace function
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
  -- Only return basic marketplace info, no sensitive PII
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

-- 6. Grant minimal permissions
REVOKE ALL ON public.therapists FROM authenticated;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_therapist_marketplace_data() TO authenticated;

-- 7. Add data access monitoring function (called manually, not via trigger)
CREATE OR REPLACE FUNCTION public.audit_data_access(
  p_table_name text,
  p_record_id uuid,
  p_operation text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.log_security_event(
    auth.uid(),
    'data_access_audit',
    p_table_name,
    p_record_id,
    jsonb_build_object(
      'operation', p_operation,
      'table', p_table_name,
      'timestamp', now()
    )
  );
END;
$$;