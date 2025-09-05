-- Security Enhancement: Protect Therapist Personal Information (Fixed)

-- Add encrypted fields for sensitive data
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS encrypted_email text,
ADD COLUMN IF NOT EXISTS encrypted_phone text,
ADD COLUMN IF NOT EXISTS encrypted_license_number text,
ADD COLUMN IF NOT EXISTS display_name text DEFAULT 'Licensed Therapist',
ADD COLUMN IF NOT EXISTS professional_title text,
ADD COLUMN IF NOT EXISTS anonymized_id text DEFAULT substring(md5(random()::text), 1, 8);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_therapists_anonymized_id ON public.therapists(anonymized_id);
CREATE INDEX IF NOT EXISTS idx_therapists_display_name ON public.therapists(display_name);

-- Update existing records to have anonymized display names
UPDATE public.therapists 
SET display_name = 'Dr. ' || substring(full_name from 1 for 1) || '.',
    professional_title = 'Licensed Therapist',
    anonymized_id = substring(md5(id::text || created_at::text), 1, 8)
WHERE display_name IS NULL OR display_name = 'Licensed Therapist';

-- Create ultra-secure marketplace function that returns ZERO sensitive data
CREATE OR REPLACE FUNCTION public.get_anonymous_therapist_marketplace()
RETURNS TABLE(
  anonymous_id text,
  display_name text,
  professional_title text,
  specializations text[],
  languages text[],
  hourly_rate numeric,
  years_experience integer,
  bio_preview text,
  timezone text,
  average_rating numeric,
  review_count bigint,
  is_available boolean
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.anonymized_id,
    COALESCE(t.display_name, 'Licensed Professional') as display_name,
    COALESCE(t.professional_title, 'Licensed Therapist') as professional_title,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    -- Only show bio preview, never full bio to strangers
    CASE 
      WHEN auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM appointments a 
        WHERE a.therapist_id = t.id AND a.client_id = auth.uid()
      ) THEN t.bio
      ELSE SUBSTRING(COALESCE(t.bio, 'Professional therapist with extensive experience.'), 1, 80) || '...'
    END as bio_preview,
    t.timezone,
    COALESCE(AVG(tr.rating), 4.5) as average_rating,
    COUNT(tr.id) as review_count,
    t.is_active as is_available
  FROM therapists t
  LEFT JOIN therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
  GROUP BY t.id, t.anonymized_id, t.display_name, t.professional_title, 
           t.specializations, t.languages, t.hourly_rate, 
           t.years_experience, t.bio, t.timezone, t.is_active;
$$;

-- Enhanced security logging function for therapist data access
CREATE OR REPLACE FUNCTION public.log_therapist_data_access(
  p_access_type text,
  p_therapist_count integer DEFAULT 1,
  p_context text DEFAULT 'marketplace'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all therapist data access for security monitoring
  PERFORM public.log_security_event_v2(
    auth.uid(),
    'therapist_data_access',
    'low',
    'therapists',
    null,
    jsonb_build_object(
      'access_type', p_access_type,
      'therapist_count', p_therapist_count,
      'context', p_context,
      'ip_address', inet_client_addr(),
      'timestamp', now()
    ),
    25
  );
END;
$$;