-- Fix remaining functions that may not have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id, language_preference, theme_preference)
  VALUES (NEW.id, 'en', 'light')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_timeline_score()
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

CREATE OR REPLACE FUNCTION public.get_therapist_patients_summary(therapist_user_id uuid)
RETURNS TABLE(patient_id uuid, patient_name text, appointment_count bigint, last_session timestamp with time zone, avg_mood numeric, total_conversations bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id as patient_id,
    p.full_name as patient_name,
    COUNT(DISTINCT a.id) as appointment_count,
    MAX(a.scheduled_at) as last_session,
    COALESCE(AVG(me.mood_value), 0) as avg_mood,
    COUNT(DISTINCT c.id) as total_conversations
  FROM profiles p
  LEFT JOIN appointments a ON p.id = a.client_id
  LEFT JOIN therapists t ON a.therapist_id = t.id
  LEFT JOIN mood_entries me ON p.id = me.user_id AND me.created_at >= NOW() - INTERVAL '30 days'
  LEFT JOIN conversations c ON p.id = c.user_id AND c.created_at >= NOW() - INTERVAL '30 days'
  WHERE t.user_id = therapist_user_id
  GROUP BY p.id, p.full_name
  ORDER BY last_session DESC NULLS LAST;
$function$;

CREATE OR REPLACE FUNCTION public.update_payment_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  analytics_date DATE := CURRENT_DATE;
BEGIN
  -- Upsert daily analytics
  INSERT INTO payment_analytics (
    date,
    total_revenue_cents,
    subscription_revenue_cents,
    pay_per_play_revenue_cents,
    active_subscribers,
    new_subscribers,
    churned_subscribers,
    stripe_transactions
  )
  VALUES (
    analytics_date,
    0, 0, 0, 0, 0, 0, 0
  )
  ON CONFLICT (date) DO NOTHING;
  
  -- Update based on trigger type
  IF TG_TABLE_NAME = 'subscribers' THEN
    IF TG_OP = 'INSERT' AND NEW.subscribed = true THEN
      UPDATE payment_analytics SET new_subscribers = new_subscribers + 1 WHERE date = analytics_date;
    ELSIF TG_OP = 'UPDATE' AND OLD.subscribed = true AND NEW.subscribed = false THEN
      UPDATE payment_analytics SET churned_subscribers = churned_subscribers + 1 WHERE date = analytics_date;
    END IF;
  ELSIF TG_TABLE_NAME = 'pay_per_play_transactions' AND NEW.payment_status = 'completed' THEN
    UPDATE payment_analytics SET 
      pay_per_play_revenue_cents = pay_per_play_revenue_cents + NEW.amount_cents,
      total_revenue_cents = total_revenue_cents + NEW.amount_cents,
      stripe_transactions = stripe_transactions + 1
    WHERE date = analytics_date;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_ai_interaction(p_user_id uuid, p_message text, p_response text, p_language text DEFAULT 'en'::text, p_context text DEFAULT 'general'::text, p_ai_tone text DEFAULT 'supportive'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  conversation_id UUID;
BEGIN
  -- Insert the conversation
  INSERT INTO public.conversations (
    user_id,
    message,
    response,
    language_preference,
    context,
    ai_tone
  )
  VALUES (
    p_user_id,
    p_message,
    p_response,
    p_language,
    p_context,
    p_ai_tone
  )
  RETURNING id INTO conversation_id;
  
  -- Return the new conversation ID
  RETURN conversation_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_achievement(p_user_id uuid, p_achievement_name text, p_points integer DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  achievement_record public.achievements%ROWTYPE;
  existing_record public.user_achievements%ROWTYPE;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record 
  FROM public.achievements 
  WHERE name = p_achievement_name;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user already has this achievement
  SELECT * INTO existing_record
  FROM public.user_achievements
  WHERE user_id = p_user_id AND achievement_name = p_achievement_name;
  
  IF FOUND THEN
    RETURN false; -- Already has achievement
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (
    user_id,
    achievement_name,
    achievement_type,
    description,
    points_earned,
    total_xp
  ) VALUES (
    p_user_id,
    achievement_record.name,
    achievement_record.category,
    achievement_record.description,
    COALESCE(p_points, achievement_record.points),
    COALESCE(p_points, achievement_record.points)
  );
  
  -- Update user's total XP
  UPDATE public.user_achievements 
  SET total_xp = total_xp + COALESCE(p_points, achievement_record.points)
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$function$;