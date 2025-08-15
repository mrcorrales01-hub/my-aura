-- Create the function to log AI interactions
CREATE OR REPLACE FUNCTION public.log_ai_interaction(
  p_user_id UUID,
  p_message TEXT,
  p_response TEXT,
  p_language TEXT DEFAULT 'en',
  p_context TEXT DEFAULT 'general',
  p_ai_tone TEXT DEFAULT 'supportive'
) 
RETURNS UUID 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Give minimal execution rights to authenticated users
GRANT EXECUTE ON FUNCTION public.log_ai_interaction(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Ensure the service_role also has permission
GRANT EXECUTE ON FUNCTION public.log_ai_interaction(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;