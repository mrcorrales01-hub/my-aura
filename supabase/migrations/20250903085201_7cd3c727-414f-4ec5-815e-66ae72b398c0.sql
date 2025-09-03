-- Enhanced security functions and policies for comprehensive protection

-- Create function to get therapist data with field-level security
CREATE OR REPLACE FUNCTION public.get_secure_therapist_data(p_therapist_id uuid DEFAULT NULL)
RETURNS TABLE(
  id uuid,
  full_name text,
  specializations text[],
  languages text[],
  hourly_rate numeric,
  years_experience integer,
  bio text,
  timezone text,
  availability jsonb,
  average_rating numeric,
  review_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return sanitized, public-safe data
  RETURN QUERY
  SELECT 
    t.id,
    t.full_name,
    t.specializations,
    t.languages,
    t.hourly_rate,
    t.years_experience,
    -- Limit bio to prevent information leakage
    CASE 
      WHEN auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM appointments a 
        WHERE a.therapist_id = t.id AND a.client_id = auth.uid()
      ) THEN t.bio
      ELSE SUBSTRING(t.bio, 1, 150) || '...'
    END as bio,
    t.timezone,
    -- Filter sensitive availability data
    jsonb_build_object(
      'general_availability', COALESCE(t.availability->'general_availability', '{}'),
      'timezone', t.timezone
    ) as availability,
    COALESCE(AVG(tr.rating), 0) as average_rating,
    COUNT(tr.id) as review_count
  FROM therapists t
  LEFT JOIN therapist_reviews tr ON t.id = tr.therapist_id
  WHERE t.is_active = true 
    AND t.is_verified = true
    AND (p_therapist_id IS NULL OR t.id = p_therapist_id)
  GROUP BY t.id, t.full_name, t.specializations, t.languages, 
           t.hourly_rate, t.years_experience, t.bio, t.timezone, t.availability;
END;
$$;

-- Create function for enhanced password validation
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{}';
  strength_score integer := 0;
  issues text[] := ARRAY[]::text[];
BEGIN
  -- Length checks
  IF LENGTH(password_text) >= 8 THEN strength_score := strength_score + 20; END IF;
  IF LENGTH(password_text) >= 12 THEN strength_score := strength_score + 10; END IF;
  IF LENGTH(password_text) >= 16 THEN strength_score := strength_score + 10; END IF;
  
  -- Character variety checks
  IF password_text ~ '[a-z]' THEN strength_score := strength_score + 15; ELSE issues := array_append(issues, 'Add lowercase letters'); END IF;
  IF password_text ~ '[A-Z]' THEN strength_score := strength_score + 15; ELSE issues := array_append(issues, 'Add uppercase letters'); END IF;
  IF password_text ~ '[0-9]' THEN strength_score := strength_score + 15; ELSE issues := array_append(issues, 'Add numbers'); END IF;
  IF password_text ~ '[!@#$%^&*(),.?":{}|<>]' THEN strength_score := strength_score + 15; ELSE issues := array_append(issues, 'Add special characters'); END IF;
  
  -- Common password patterns (basic check)
  IF password_text ~* '(password|123456|qwerty|abc123|admin|letmein|welcome)' THEN
    strength_score := GREATEST(strength_score - 50, 0);
    issues := array_append(issues, 'Password is too common');
  END IF;
  
  result := jsonb_build_object(
    'strength_score', LEAST(strength_score, 100),
    'is_strong', strength_score >= 60,
    'issues', to_jsonb(issues),
    'recommendation', CASE 
      WHEN strength_score < 40 THEN 'Weak - please strengthen'
      WHEN strength_score < 70 THEN 'Medium - consider improvements'
      ELSE 'Strong'
    END
  );
  
  RETURN result;
END;
$$;

-- Enhanced crisis detection function
CREATE OR REPLACE FUNCTION public.enhanced_crisis_detection(content_text text, context_type text DEFAULT 'general')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    PERFORM public.log_security_event_v2(
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

-- Apply enhanced audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_appointments_access ON appointments;
CREATE TRIGGER audit_appointments_access  
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_data_changes_v2();

DROP TRIGGER IF EXISTS audit_safety_networks_access ON safety_networks;
CREATE TRIGGER audit_safety_networks_access
  AFTER INSERT OR UPDATE OR DELETE ON safety_networks
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_data_changes_v2();