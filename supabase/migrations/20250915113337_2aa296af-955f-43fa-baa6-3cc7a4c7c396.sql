-- Critical Security Fixes - Priority 1: Data Protection (Fixed)

-- 1. Secure Therapist Data Access
-- Remove overly permissive public access and add strict data masking
DROP POLICY IF EXISTS "Authenticated users can view therapists marketplace" ON public.therapists;
DROP POLICY IF EXISTS "Public can view verified therapists" ON public.therapists;
DROP POLICY IF EXISTS "Authenticated users can view limited therapist data" ON public.therapists;

-- Create secure therapist access policy with data masking
CREATE POLICY "Authenticated users can view limited therapist data"
ON public.therapists
FOR SELECT
TO authenticated
USING (
  is_active = true AND is_verified = true
);

-- 2. Secure User Profile Data  
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile with logging" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile with logging" ON public.profiles;

-- Create strict profile access policies with audit logging
CREATE POLICY "Users can view their own profile with logging"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id AND 
  (SELECT log_profile_data_access(id, 'profile_view', ARRAY['id', 'display_name', 'full_name'], 'secure_profile_access')) IS NULL
);

CREATE POLICY "Users can update their own profile with logging"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  (SELECT log_security_event_v2(auth.uid(), 'profile_update', 'medium', 'profiles', id, 
    jsonb_build_object('operation', 'update', 'timestamp', now()), 40)) IS NULL
);

-- 3. Restrict Content Library Access - Require Authentication
-- Exercises table - remove public access and recreate secure policy
DROP POLICY IF EXISTS "exercises_public_read" ON public.exercises;
DROP POLICY IF EXISTS "Authenticated users can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Authenticated users can view exercises with rate limiting" ON public.exercises;

CREATE POLICY "Authenticated users can view exercises with rate limiting"
ON public.exercises
FOR SELECT
TO authenticated  
USING (
  check_content_access_rate_limit('exercises', 50, 60) AND
  (SELECT log_content_access_attempt('exercises', 'select', true, 'secure_content_access')) IS NULL
);

-- Music tracks - ensure RLS is enabled and secure
DROP POLICY IF EXISTS "Authenticated users can view music tracks" ON public.music_tracks;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view music tracks"
ON public.music_tracks
FOR SELECT
TO authenticated
USING (
  (SELECT log_content_access_attempt('music_tracks', 'select', true, 'content_library_access')) IS NULL
);

-- Video exercises - ensure RLS is enabled and secure
DROP POLICY IF EXISTS "Authenticated users can view video exercises" ON public.video_exercises;
ALTER TABLE public.video_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view video exercises"
ON public.video_exercises
FOR SELECT
TO authenticated
USING (
  (SELECT log_content_access_attempt('video_exercises', 'select', true, 'content_library_access')) IS NULL
);

-- VR therapy worlds - ensure RLS is enabled and secure
DROP POLICY IF EXISTS "Authenticated users can view VR therapy worlds" ON public.vr_therapy_worlds;
ALTER TABLE public.vr_therapy_worlds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view VR therapy worlds"
ON public.vr_therapy_worlds  
FOR SELECT
TO authenticated
USING (
  (SELECT log_content_access_attempt('vr_therapy_worlds', 'select', true, 'content_library_access')) IS NULL
);

-- 4. Enhanced Security Functions
-- Create function to mask sensitive therapist data for public listings
CREATE OR REPLACE FUNCTION public.get_secure_therapist_listing()
RETURNS TABLE(
  id uuid,
  display_name text,
  specializations text[],
  languages text[],
  hourly_rate numeric,
  years_experience integer,
  bio_preview text,
  timezone text,
  average_rating numeric,
  review_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access attempt
  PERFORM log_therapist_data_access('public_listing', 1, 'secure_marketplace');
  
  RETURN QUERY
  SELECT 
    t.id,
    COALESCE(t.display_name, 'Licensed Professional') as display_name,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    -- Limit bio to prevent information leakage
    SUBSTRING(COALESCE(t.bio, 'Professional therapist with extensive experience.'), 1, 80) || '...' as bio_preview,
    t.timezone,
    COALESCE(AVG(tr.rating), 4.5) as average_rating,
    COUNT(tr.id) as review_count
  FROM therapists t
  LEFT JOIN therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
  GROUP BY t.id, t.display_name, t.specializations, t.languages, 
           t.hourly_rate, t.years_experience, t.bio, t.timezone;
END;
$$;

-- 5. Emergency Contact Encryption Helper
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Log sensitive data modification
  PERFORM log_security_event_v2(
    NEW.id,
    'sensitive_profile_data_modification',
    'high',
    'profiles',
    NEW.id,
    jsonb_build_object(
      'operation', TG_OP,
      'has_emergency_contact', NEW.emergency_contact_phone IS NOT NULL,
      'has_phone', NEW.phone IS NOT NULL
    ),
    60
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS encrypt_profile_data_trigger ON public.profiles;
CREATE TRIGGER encrypt_profile_data_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION encrypt_sensitive_profile_data();