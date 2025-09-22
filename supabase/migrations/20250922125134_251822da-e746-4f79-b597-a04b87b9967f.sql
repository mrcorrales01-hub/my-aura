-- Security Fix: Add search_path to all remaining functions that don't have it set
-- Update functions identified by the linter as having mutable search paths

CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_comments 
    SET like_count = like_count - 1 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET like_count = like_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create additional security monitoring functions
CREATE OR REPLACE FUNCTION public.monitor_sensitive_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access to sensitive tables
  IF TG_TABLE_NAME IN ('therapists', 'appointments', 'profiles', 'safety_networks') THEN
    PERFORM public.log_security_event_v2(
      auth.uid(),
      'sensitive_table_access',
      'medium',
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'timestamp', now()
      ),
      CASE 
        WHEN TG_TABLE_NAME = 'therapists' AND TG_OP = 'SELECT' THEN 50
        WHEN TG_TABLE_NAME = 'appointments' THEN 60
        WHEN TG_TABLE_NAME = 'safety_networks' THEN 70
        ELSE 40
      END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;