-- Create Auri chat sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lang text DEFAULT 'sv',
  created_at timestamptz DEFAULT now()
);

-- Create messages table for chat history
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content text NOT NULL,
  tokens int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create roleplay scripts table
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

-- Create roleplay runs table
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

-- Insert sample roleplay scripts
INSERT INTO public.roleplay_scripts (slug, title, description, language, steps) VALUES
('panic-supermarket', 'Managing Panic in Public', 'Practice staying calm during a panic attack in a crowded place', 'en', '[
  {
    "id": 1,
    "prompt": "You are in a crowded supermarket when you suddenly feel your heart racing and breathing becoming difficult. What is your first response?",
    "options": [
      {"text": "Find a quiet corner or bathroom", "next": 2, "value": "find_space"},
      {"text": "Leave the store immediately", "next": 3, "value": "leave"},
      {"text": "Try to ignore it and continue shopping", "next": 4, "value": "ignore"}
    ]
  },
  {
    "id": 2,
    "prompt": "Good choice! You found a quieter space. Now focus on your breathing. Remember the 4-7-8 technique: breathe in for 4, hold for 7, exhale for 8. How do you feel after trying this?",
    "options": [
      {"text": "A bit calmer, but still anxious", "next": 5, "value": "better"},
      {"text": "No change, still very panicked", "next": 6, "value": "same"},
      {"text": "Much better, ready to continue", "next": 7, "value": "recovered"}
    ]
  }
]'::jsonb),
('difficult-conversation', 'Having Difficult Conversations', 'Practice approaching sensitive topics with empathy', 'en', '[
  {
    "id": 1,
    "prompt": "Your friend has been distant lately and you want to talk to them about it. How do you start the conversation?",
    "options": [
      {"text": "Are you mad at me? You have been avoiding me.", "next": 2, "value": "direct"},
      {"text": "I have noticed we have not talked much lately. Is everything okay?", "next": 3, "value": "gentle"},
      {"text": "You are being weird. What is wrong with you?", "next": 4, "value": "confrontational"}
    ]
  }
]'::jsonb);

-- Insert Swedish versions
INSERT INTO public.roleplay_scripts (slug, title, description, language, steps) VALUES
('panic-supermarket', 'Hantera panik i offentliga miljöer', 'Öva på att hålla dig lugn under en panikattack på en folkrik plats', 'sv', '[
  {
    "id": 1,
    "prompt": "Du är i en folktät affär när du plötsligt känner ditt hjärta slå snabbare och andningen blir svår. Vad är din första reaktion?",
    "options": [
      {"text": "Hitta ett tyst hörn eller en toalett", "next": 2, "value": "find_space"},
      {"text": "Lämna affären omedelbart", "next": 3, "value": "leave"},
      {"text": "Försök ignorera det och fortsätt handla", "next": 4, "value": "ignore"}
    ]
  }
]'::jsonb),
('difficult-conversation', 'Svåra samtal', 'Öva på att närma dig känsliga ämnen med empati', 'sv', '[
  {
    "id": 1,
    "prompt": "Din vän har varit distanserad på sistone och du vill prata med dem om det. Hur börjar du samtalet?",
    "options": [
      {"text": "Är du arg på mig? Du har undvikit mig.", "next": 2, "value": "direct"},
      {"text": "Jag har märkt att vi inte pratat så mycket på sistone. Är allt okej?", "next": 3, "value": "gentle"},
      {"text": "Du är konstig. Vad är det för fel på dig?", "next": 4, "value": "confrontational"}
    ]
  }
]'::jsonb);