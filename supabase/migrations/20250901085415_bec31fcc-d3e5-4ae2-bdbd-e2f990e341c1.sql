-- Create Auri chat sessions table (only if not exists)
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lang text DEFAULT 'sv',
  created_at timestamptz DEFAULT now()
);

-- Create messages table for chat history (only if not exists)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content text NOT NULL,
  tokens int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create roleplay scripts table (only if not exists)
CREATE TABLE IF NOT EXISTS public.roleplay_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  language text DEFAULT 'sv',
  steps jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create roleplay runs table (only if not exists)
CREATE TABLE IF NOT EXISTS public.roleplay_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  script_id uuid REFERENCES public.roleplay_scripts(id) ON DELETE CASCADE NOT NULL,
  current_step int DEFAULT 0,
  state jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_runs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their sessions" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can view active roleplay scripts" ON public.roleplay_scripts;
DROP POLICY IF EXISTS "Users can manage their own roleplay runs" ON public.roleplay_runs;

-- RLS policies for sessions - users can only access their own
CREATE POLICY "Users can manage their own sessions" ON public.sessions
FOR ALL USING (auth.uid() = user_id);

-- RLS policies for messages - users can only access messages from their sessions
CREATE POLICY "Users can view messages from their sessions" ON public.messages
FOR SELECT USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their sessions" ON public.messages
FOR INSERT WITH CHECK (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);

-- RLS policies for roleplay scripts - viewable by all authenticated users
CREATE POLICY "Authenticated users can view active roleplay scripts" ON public.roleplay_scripts
FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- RLS policies for roleplay runs - users can only access their own
CREATE POLICY "Users can manage their own roleplay runs" ON public.roleplay_runs
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_session_created ON public.messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON public.sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_roleplay_scripts_slug ON public.roleplay_scripts(slug);
CREATE INDEX IF NOT EXISTS idx_roleplay_scripts_lang ON public.roleplay_scripts(language, is_active);
CREATE INDEX IF NOT EXISTS idx_roleplay_runs_user ON public.roleplay_runs(user_id, updated_at);