-- Create AI Coach Edge Function
-- This will be handled by the function creation below

-- Create an enhanced function to handle edge function logging
CREATE OR REPLACE FUNCTION public.log_ai_interaction(
  p_user_id UUID,
  p_message TEXT,
  p_response TEXT,
  p_language TEXT DEFAULT 'en',
  p_context TEXT DEFAULT 'general',
  p_ai_tone TEXT DEFAULT 'supportive'
) RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  INSERT INTO public.conversations (
    user_id,
    message,
    response,
    language_preference,
    context,
    ai_tone
  ) VALUES (
    p_user_id,
    p_message,
    p_response,
    p_language,
    p_context,
    p_ai_tone
  ) RETURNING id INTO conversation_id;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;