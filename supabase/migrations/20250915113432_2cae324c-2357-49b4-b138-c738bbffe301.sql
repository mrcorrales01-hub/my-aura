-- Security Linter Fixes - Address remaining security warnings

-- 1. Fix Function Search Path Mutable - Secure all functions with proper search_path
-- Update existing functions to have secure search paths

-- Fix get_secure_therapist_listing function
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
SET search_path = 'public'
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
  FROM public.therapists t
  LEFT JOIN public.therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
  GROUP BY t.id, t.display_name, t.specializations, t.languages, 
           t.hourly_rate, t.years_experience, t.bio, t.timezone;
END;
$$;

-- Fix encrypt_sensitive_profile_data function
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_profile_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

-- Update all existing database functions to have secure search paths
-- This covers functions that might be missing secure search paths

-- Fix moderate_content function
CREATE OR REPLACE FUNCTION public.moderate_content(content_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  flagged_terms text[] := ARRAY['spam', 'abuse', 'harassment', 'threat'];
  result jsonb := '{}'::jsonb;
  term text;
  content_lower text := lower(content_text);
BEGIN
  result := jsonb_build_object('flagged', false, 'reasons', '[]'::jsonb);
  
  FOREACH term IN ARRAY flagged_terms
  LOOP
    IF content_lower LIKE '%' || term || '%' THEN
      result := jsonb_set(result, '{flagged}', 'true'::jsonb);
      result := jsonb_set(
        result, 
        '{reasons}', 
        (result->'reasons') || jsonb_build_array(term)
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Fix enhanced_content_moderation function
CREATE OR REPLACE FUNCTION public.enhanced_content_moderation(content_text text, content_type text DEFAULT 'post')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
      PERFORM log_security_event_v2(
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

-- Fix enhanced_crisis_detection function
CREATE OR REPLACE FUNCTION public.enhanced_crisis_detection(content_text text, context_type text DEFAULT 'general')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  crisis_indicators text[] := ARRAY[
    'suicide', 'kill myself', 'end it all', 'not worth living', 'want to die',
    'self-harm', 'hurt myself', 'cut myself', 'no point in living',
    'better off dead', 'end my life', 'take my own life', 'overdose',
    'jump off', 'hang myself', 'shoot myself', 'worthless', 'hopeless',
    'nobody cares', 'everyone would be better without me'
  ];
  severity_score integer := 0;
  detected_terms text[] := ARRAY[]::text[];
  content_lower text := lower(content_text);
  term text;
  result jsonb;
BEGIN
  -- Check for crisis indicators
  FOREACH term IN ARRAY crisis_indicators
  LOOP
    IF content_lower LIKE '%' || term || '%' THEN
      detected_terms := array_append(detected_terms, term);
      severity_score := severity_score + CASE
        WHEN term IN ('suicide', 'kill myself', 'end my life', 'take my own life') THEN 50
        WHEN term IN ('self-harm', 'hurt myself', 'cut myself') THEN 30
        WHEN term IN ('worthless', 'hopeless', 'not worth living') THEN 20
        ELSE 15
      END;
    END IF;
  END LOOP;
  
  -- Contextual adjustments
  IF context_type = 'emergency' THEN
    severity_score := severity_score + 25;
  END IF;
  
  result := jsonb_build_object(
    'crisis_detected', array_length(detected_terms, 1) > 0,
    'severity_score', LEAST(severity_score, 100),
    'severity_level', CASE
      WHEN severity_score >= 70 THEN 'critical'
      WHEN severity_score >= 40 THEN 'high'
      WHEN severity_score >= 20 THEN 'medium'
      ELSE 'low'
    END,
    'detected_terms', to_jsonb(detected_terms),
    'immediate_intervention_required', severity_score >= 70,
    'professional_referral_suggested', severity_score >= 40,
    'context_type', context_type
  );
  
  -- Log critical cases immediately
  IF severity_score >= 70 THEN
    PERFORM log_security_event_v2(
      auth.uid(),
      'critical_crisis_detected',
      'critical',
      'crisis_detection',
      null,
      jsonb_build_object(
        'severity_score', severity_score,
        'context_type', context_type,
        'detected_count', array_length(detected_terms, 1)
      ),
      95
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 2. Enable Password Leak Protection
-- Note: This needs to be done through Supabase dashboard Auth settings
-- But we can create a monitoring function for this

CREATE OR REPLACE FUNCTION public.check_password_security_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function can be called to remind about password security settings
  -- The actual configuration needs to be done in Supabase dashboard
  RETURN jsonb_build_object(
    'message', 'Password leak protection should be enabled in Supabase Auth settings',
    'url', 'https://supabase.com/dashboard/project/rggohnwmajmrvxgfmimk/auth/providers',
    'required_action', 'Enable password leak protection in Auth > Settings > Password Protection'
  );
END;
$$;