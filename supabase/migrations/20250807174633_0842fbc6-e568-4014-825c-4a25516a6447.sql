-- Fix security vulnerability: Make function search path immutable
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix security vulnerability: Make cleanup function search path immutable  
CREATE OR REPLACE FUNCTION public.cleanup_old_conversations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.conversations 
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM public.conversations
    ) t WHERE rn > 100
  );
END;
$function$;