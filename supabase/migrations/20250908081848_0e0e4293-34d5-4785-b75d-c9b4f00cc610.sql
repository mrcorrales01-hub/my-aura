-- CRITICAL SECURITY FIX: Enable RLS on journal_entries_backup table
-- This table currently exposes private mental health data without protection
ALTER TABLE public.journal_entries_backup ENABLE ROW LEVEL SECURITY;

-- Add RLS policy to restrict access to user's own data only
CREATE POLICY "Users can only access their own backup journal entries"
ON public.journal_entries_backup
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- SECURITY HARDENING: Update database functions to use secure search_path
-- This prevents potential privilege escalation attacks

CREATE OR REPLACE FUNCTION public.get_user_group_memberships(p_user_id uuid)
RETURNS TABLE(group_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT gm.group_id 
  FROM public.group_members gm
  WHERE gm.user_id = p_user_id;
$function$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_user_id uuid, p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.user_id = p_user_id AND gm.group_id = p_group_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_group_therapy_participant(p_user_id uuid, p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.group_therapy_participants gtp
    WHERE gtp.user_id = p_user_id AND gtp.session_id = p_session_id
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_access_appointment(appointment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id
    AND (
      a.client_id = auth.uid() 
      OR a.therapist_id IN (
        SELECT t.id FROM public.therapists t WHERE t.user_id = auth.uid()
      )
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_therapist_marketplace_data()
RETURNS TABLE(id uuid, full_name text, specializations text[], languages text[], hourly_rate numeric, years_experience integer, bio text, profile_image_url text, timezone text, availability jsonb, average_rating numeric, review_count bigint)
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
$function$;

CREATE OR REPLACE FUNCTION public.get_therapist_public_info(therapist_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(id uuid, full_name text, specializations text[], languages text[], hourly_rate numeric, years_experience integer, bio text, profile_image_url text, timezone text, availability jsonb, average_rating numeric, review_count bigint)
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
$function$;

CREATE OR REPLACE FUNCTION public.get_all_therapists_public()
RETURNS TABLE(id uuid, full_name text, specializations text[], languages text[], hourly_rate numeric, years_experience integer, bio text, profile_image_url text, timezone text, availability jsonb, average_rating numeric, review_count bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT * FROM public.get_therapist_public_info(NULL);
$function$;

CREATE OR REPLACE FUNCTION public.get_secure_therapist_marketplace_v2()
RETURNS TABLE(id uuid, full_name text, specializations text[], languages text[], hourly_rate numeric, years_experience integer, bio text, timezone text, availability jsonb, average_rating numeric, review_count bigint)
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
    CASE 
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
$function$;

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
$function$;

CREATE OR REPLACE FUNCTION public.get_secure_profile_data(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(id uuid, display_name text, bio text, avatar_url text, timezone text, language_preference text, age_group text, profile_visibility text, created_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    COALESCE(p.display_name, 'User') as display_name,
    CASE 
      WHEN p.profile_visibility = 'public' OR auth.uid() = p.id THEN p.bio
      ELSE NULL
    END as bio,
    p.avatar_url,
    CASE 
      WHEN auth.uid() = p.id THEN p.timezone
      ELSE NULL
    END as timezone,
    CASE 
      WHEN auth.uid() = p.id THEN p.language_preference
      ELSE NULL
    END as language_preference,
    p.age_group,
    p.profile_visibility,
    p.created_at
  FROM profiles p
  WHERE p.id = p_user_id
    AND (
      p.profile_visibility = 'public' 
      OR auth.uid() = p.id 
      OR auth.uid() IN (
        SELECT fa.created_by FROM family_accounts fa 
        WHERE fa.id = p.family_account_id
      )
    );
$function$;

CREATE OR REPLACE FUNCTION public.get_full_profile_data()
RETURNS TABLE(id uuid, email text, full_name text, display_name text, phone text, emergency_contact_name text, emergency_contact_phone text, date_of_birth date, bio text, avatar_url text, timezone text, language_preference text, family_account_id uuid, relationship_type text, age_group text, birth_year integer, profile_visibility text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    id, email, full_name, display_name, phone,
    emergency_contact_name, emergency_contact_phone, date_of_birth,
    bio, avatar_url, timezone, language_preference,
    family_account_id, relationship_type, age_group, birth_year,
    profile_visibility, created_at, updated_at
  FROM profiles 
  WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_emergency_contacts(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(contact_name text, relationship text, verification_status text, crisis_notifications boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    'Emergency Contact' as contact_name,
    sn.relationship,
    sn.verification_status,
    sn.crisis_notifications
  FROM safety_networks sn
  WHERE sn.user_id = p_user_id
    AND sn.emergency_contact = true
    AND auth.uid() = p_user_id;
$function$;

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
$function$;

CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_therapist_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id FROM public.therapists WHERE user_id = auth.uid();
$function$;