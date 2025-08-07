-- Fix conversations table schema to match AI coach function expectations
-- Add missing columns and update existing ones

-- First, check if we need to add any missing columns
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS ai_tone text DEFAULT 'supportive';

-- Update the conversations table to have better indexing for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_created_at 
ON public.conversations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_context 
ON public.conversations(context);

-- Add a function to clean up old conversations (keep last 100 per user)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;