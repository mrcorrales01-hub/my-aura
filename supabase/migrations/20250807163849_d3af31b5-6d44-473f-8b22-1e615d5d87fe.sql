-- Add missing language_preference column to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' 
CHECK (language_preference IN ('en', 'es', 'zh', 'hi', 'ar', 'pt', 'bn', 'ru', 'ja', 'pa', 'de', 'fr', 'tr', 'vi', 'ko', 'it', 'ur', 'fa', 'sw', 'tl', 'sv', 'no'));