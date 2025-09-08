-- Fix remaining functions without proper search_path
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_table_name text, p_record_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    ip_address
  ) VALUES (
    p_user_id,
    p_event_type,
    p_table_name,
    p_record_id,
    p_details,
    inet_client_addr()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_data_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log sensitive data changes
  IF TG_TABLE_NAME IN ('profiles', 'therapists', 'safety_networks') THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'data_modification',
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'operation', TG_OP,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.moderate_content(content_text text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := to_char(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM LENGTH(year_month) + 2) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM payment_receipts 
  WHERE receipt_number LIKE year_month || '-%';
  
  RETURN year_month || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := generate_receipt_number();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_data_access(p_table_name text, p_record_id uuid, p_operation text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event_v2(p_user_id uuid, p_event_type text, p_severity_level text DEFAULT 'info'::text, p_table_name text DEFAULT NULL::text, p_record_id uuid DEFAULT NULL::uuid, p_event_details jsonb DEFAULT '{}'::jsonb, p_risk_score integer DEFAULT 0)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity_level,
    table_name,
    record_id,
    event_details,
    ip_address,
    risk_score
  ) VALUES (
    p_user_id,
    p_event_type,
    p_severity_level,
    p_table_name,
    p_record_id,
    p_event_details,
    inet_client_addr(),
    p_risk_score
  );
  
  -- Alert on high-risk events
  IF p_risk_score > 75 OR p_severity_level = 'critical' THEN
    -- Log to audit_logs for immediate attention
    PERFORM public.log_security_event_enhanced(
      p_user_id,
      'high_risk_security_event',
      COALESCE(p_table_name, 'security_events'),
      p_record_id,
      p_event_details,
      'critical'
    );
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_data_access_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  risk_score integer := 0;
  event_details jsonb;
BEGIN
  -- Calculate risk score based on table and operation
  IF TG_TABLE_NAME IN ('therapists', 'appointments', 'safety_networks') THEN
    risk_score := 60;
  ELSIF TG_TABLE_NAME IN ('profiles', 'conversations', 'mood_entries') THEN
    risk_score := 40;
  ELSE
    risk_score := 20;
  END IF;
  
  -- Higher risk for DELETE operations
  IF TG_OP = 'DELETE' THEN
    risk_score := risk_score + 30;
  END IF;
  
  event_details := jsonb_build_object(
    'operation', TG_OP,
    'table_name', TG_TABLE_NAME,
    'timestamp', now(),
    'record_id', COALESCE(NEW.id, OLD.id)
  );
  
  -- Log security event
  PERFORM public.log_security_event_v2(
    auth.uid(),
    'sensitive_data_access',
    CASE 
      WHEN risk_score > 70 THEN 'high'
      WHEN risk_score > 40 THEN 'medium'
      ELSE 'low'
    END,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    event_details,
    risk_score
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.enhanced_content_moderation(content_text text, content_type text DEFAULT 'post'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
      PERFORM public.log_security_event_v2(
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
$function$;

CREATE OR REPLACE FUNCTION public.log_therapist_data_access(p_access_type text, p_therapist_count integer DEFAULT 1, p_context text DEFAULT 'marketplace'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(p_user_id uuid, p_event_type text, p_table_name text, p_record_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info'::text, p_source_ip inet DEFAULT NULL::inet)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type || ':' || p_severity,
    p_table_name,
    p_record_id,
    jsonb_build_object(
      'details', p_details,
      'severity', p_severity,
      'timestamp', now(),
      'source_ip', COALESCE(p_source_ip, inet_client_addr())
    ),
    COALESCE(p_source_ip, inet_client_addr()),
    NULL
  );
END;
$function$;