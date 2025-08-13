-- Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  locale TEXT DEFAULT 'en',
  country TEXT,
  timezone TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  goals_json JSONB DEFAULT '{}',
  consents_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table for Stripe integration
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('free', 'plus', 'pro')),
  status TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table for chat history
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table for coaching sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('chat', 'live')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  transcript_url TEXT,
  notes_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercises table for CBT/DBT/ACT content
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  type TEXT,
  title TEXT,
  body TEXT,
  locale TEXT DEFAULT 'en',
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exercise progress tracking
CREATE TABLE public.exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  data_json JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Journal entries
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  tags TEXT[],
  audio_url TEXT,
  transcript TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Goals and habits
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  plan_json JSONB DEFAULT '{}',
  cadence TEXT,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habit logs
CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  date DATE,
  value INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- File assets
CREATE TABLE public.file_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT,
  url TEXT,
  bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safety events for content moderation
CREATE TABLE public.safety_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details_json JSONB DEFAULT '{}',
  handled_by UUID REFERENCES auth.users(id),
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Locale strings for internationalization
CREATE TABLE public.locale_strings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT,
  locale TEXT,
  value TEXT,
  namespace TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(key, locale, namespace)
);

-- Feature flags
CREATE TABLE public.feature_flags (
  key TEXT PRIMARY KEY,
  value_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs for admin actions
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id),
  action TEXT,
  entity TEXT,
  entity_id UUID,
  meta_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document chunks for RAG with vector embeddings
CREATE TABLE public.doc_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  locale TEXT DEFAULT 'en',
  source TEXT,
  title TEXT,
  chunk TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user data
CREATE POLICY "Users can view/edit own profile" ON public.profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view/manage own messages" ON public.messages
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view/manage own sessions" ON public.sessions
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public exercises" ON public.exercises
FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own exercise progress" ON public.exercise_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal entries" ON public.journal_entries
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON public.goals
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit logs" ON public.habit_logs
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.goals WHERE goals.id = habit_logs.goal_id AND goals.user_id = auth.uid()
));

CREATE POLICY "Users can manage own files" ON public.file_assets
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own safety events" ON public.safety_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own doc chunks" ON public.doc_chunks
FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_exercises_slug ON public.exercises(slug);
CREATE INDEX idx_exercises_locale ON public.exercises(locale);
CREATE INDEX idx_exercise_progress_user_id ON public.exercise_progress(user_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_habit_logs_goal_id ON public.habit_logs(goal_id);
CREATE INDEX idx_file_assets_user_id ON public.file_assets(user_id);
CREATE INDEX idx_safety_events_user_id ON public.safety_events(user_id);
CREATE INDEX idx_locale_strings_key_locale ON public.locale_strings(key, locale);
CREATE INDEX idx_doc_chunks_user_id ON public.doc_chunks(user_id);
CREATE INDEX idx_doc_chunks_embedding ON public.doc_chunks USING ivfflat (embedding vector_cosine_ops);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();