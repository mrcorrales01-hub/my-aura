-- Fix Security Definer View Issue
-- Remove the problematic view and use function-only approach

-- Drop the security definer view that was flagged by the linter
DROP VIEW IF EXISTS public.therapist_public_view;

-- Update the function to work without the view
CREATE OR REPLACE FUNCTION public.get_therapist_public_info(therapist_id uuid DEFAULT NULL)
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
  WHERE t.is_active = true 
    AND t.is_verified = true
    AND (therapist_id IS NULL OR t.id = therapist_id)
  GROUP BY t.id, t.full_name, t.specializations, t.languages, t.hourly_rate, 
           t.years_experience, t.bio, t.profile_image_url, t.timezone, t.availability;
$$;

-- Create a safer function to get all public therapist data
CREATE OR REPLACE FUNCTION public.get_all_therapists_public()
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
  SELECT * FROM public.get_therapist_public_info(NULL);
$$;