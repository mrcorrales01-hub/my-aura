-- Security Fix: Restrict therapists table access to authenticated users only
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view therapist marketplace with loggin" ON public.therapists;
DROP POLICY IF EXISTS "Authenticated users can view therapist marketplace" ON public.therapists;

-- Create secure therapist access policies
CREATE POLICY "Authenticated users can view basic therapist info" 
ON public.therapists FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND is_verified = true
);

CREATE POLICY "Therapists can update their own profiles" 
ON public.therapists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Therapists can view their own full profiles" 
ON public.therapists FOR SELECT 
USING (auth.uid() = user_id);

-- Security Fix: Restrict premium content tables to authenticated users
-- Fix music_tracks access
DROP POLICY IF EXISTS "Authenticated users can view music tracks" ON public.music_tracks;
CREATE POLICY "Authenticated users can view music tracks" 
ON public.music_tracks FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (( SELECT log_content_access_attempt('music_tracks'::text, 'select'::text, true) ) IS NULL)
);

-- Fix video_exercises access  
DROP POLICY IF EXISTS "Authenticated users can view video exercises" ON public.video_exercises;
CREATE POLICY "Authenticated users can view video exercises" 
ON public.video_exercises FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (( SELECT log_content_access_attempt('video_exercises'::text, 'select'::text, true) ) IS NULL)
);

-- Fix vr_therapy_worlds access
DROP POLICY IF EXISTS "Authenticated users can view VR worlds" ON public.vr_therapy_worlds;
CREATE POLICY "Authenticated users can view VR worlds" 
ON public.vr_therapy_worlds FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (( SELECT log_content_access_attempt('vr_therapy_worlds'::text, 'select'::text, true) ) IS NULL)
);

-- Update ai_avatars policies to be more restrictive
DROP POLICY IF EXISTS "Authenticated users can view AI avatars" ON public.ai_avatars;
DROP POLICY IF EXISTS "Authenticated users can view AI avatars with monitoring" ON public.ai_avatars;
CREATE POLICY "Authenticated users can view AI avatars securely" 
ON public.ai_avatars FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (( SELECT log_content_access_attempt('ai_avatars'::text, 'select'::text, true) ) IS NULL)
);

-- Security Fix: Update database functions to include proper search_path
-- Update existing functions to be more secure
CREATE OR REPLACE FUNCTION public.get_secure_therapist_marketplace()
RETURNS TABLE(id uuid, full_name text, specializations text[], languages text[], hourly_rate numeric, years_experience integer, bio text, timezone text, average_rating numeric, review_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    t.id,
    t.full_name,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    -- Limit bio exposure for non-clients
    CASE 
      WHEN auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.appointments a 
        WHERE a.therapist_id = t.id AND a.client_id = auth.uid()
      ) THEN t.bio
      ELSE SUBSTRING(COALESCE(t.bio, ''), 1, 100) || '...'
    END as bio,
    t.timezone,
    COALESCE(AVG(tr.rating), 0) as average_rating,
    COUNT(tr.id) as review_count
  FROM public.therapists t
  LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
    AND auth.uid() IS NOT NULL  -- Require authentication
  GROUP BY t.id, t.full_name, t.specializations, t.languages, 
           t.hourly_rate, t.years_experience, t.bio, t.timezone;
$function$;

-- Update anonymous therapist marketplace function for better security
CREATE OR REPLACE FUNCTION public.get_anonymous_therapist_marketplace()
RETURNS TABLE(anonymous_id text, display_name text, professional_title text, specializations text[], languages text[], hourly_rate numeric, years_experience integer, bio_preview text, timezone text, average_rating numeric, review_count bigint, is_available boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    t.anonymized_id,
    COALESCE(t.display_name, 'Licensed Professional') as display_name,
    COALESCE(t.professional_title, 'Licensed Therapist') as professional_title,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    -- Only show limited bio preview even for authenticated users
    SUBSTRING(COALESCE(t.bio, 'Professional therapist with extensive experience.'), 1, 80) || '...' as bio_preview,
    t.timezone,
    COALESCE(AVG(tr.rating), 4.5) as average_rating,
    COUNT(tr.id) as review_count,
    t.is_active as is_available
  FROM public.therapists t
  LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
    AND auth.uid() IS NOT NULL  -- Require authentication even for anonymous view
  GROUP BY t.id, t.anonymized_id, t.display_name, t.professional_title, 
           t.specializations, t.languages, t.hourly_rate, 
           t.years_experience, t.bio, t.timezone, t.is_active;
$function$;

-- Add security monitoring for therapist data access
CREATE OR REPLACE FUNCTION public.log_therapist_data_access_enhanced(p_access_type text, p_therapist_count integer DEFAULT 1, p_context text DEFAULT 'marketplace'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Enhanced logging with risk scoring
  PERFORM public.log_security_event_v2(
    auth.uid(),
    'therapist_data_access',
    CASE 
      WHEN p_therapist_count > 50 THEN 'medium'
      WHEN p_context = 'direct_access' THEN 'medium'
      ELSE 'low'
    END,
    'therapists',
    null,
    jsonb_build_object(
      'access_type', p_access_type,
      'therapist_count', p_therapist_count,
      'context', p_context,
      'ip_address', inet_client_addr(),
      'timestamp', now(),
      'user_authenticated', auth.uid() IS NOT NULL
    ),
    CASE 
      WHEN p_therapist_count > 100 THEN 60
      WHEN p_therapist_count > 50 THEN 40
      WHEN auth.uid() IS NULL THEN 80  -- High risk for unauthenticated access
      ELSE 25
    END
  );
END;
$function$;

-- Create function to validate premium content access
CREATE OR REPLACE FUNCTION public.validate_premium_content_access(p_content_type text, p_user_plan text DEFAULT 'free')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication for all premium content
  IF auth.uid() IS NULL THEN
    PERFORM public.log_security_event_v2(
      null,
      'unauthorized_premium_content_access',
      'high',
      p_content_type,
      null,
      jsonb_build_object(
        'content_type', p_content_type,
        'ip_address', inet_client_addr(),
        'timestamp', now()
      ),
      75
    );
    RETURN false;
  END IF;
  
  -- Log access attempt
  PERFORM public.log_content_access_attempt(p_content_type, 'premium_access', true, 'premium_content_validation');
  
  RETURN true;
END;
$function$;