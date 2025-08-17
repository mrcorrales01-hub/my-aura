-- Ultra Patch 2.0 Database Tables and Features

-- VR/AR Therapy Worlds
CREATE TABLE public.vr_therapy_worlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  environment_type TEXT NOT NULL, -- 'beach', 'forest', 'mountain', 'cosmic', 'custom'
  world_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Avatars for Roleplay
CREATE TABLE public.ai_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_type TEXT NOT NULL, -- 'therapist', 'friend', 'mentor', 'inner_child', 'custom'
  personality_traits JSONB NOT NULL DEFAULT '{}',
  appearance_data JSONB NOT NULL DEFAULT '{}',
  voice_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User VR/AR Sessions
CREATE TABLE public.user_vr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  world_id UUID REFERENCES public.vr_therapy_worlds(id),
  avatar_id UUID REFERENCES public.ai_avatars(id),
  session_type TEXT NOT NULL, -- 'meditation', 'exposure_therapy', 'roleplay', 'group'
  duration_minutes INTEGER DEFAULT 0,
  biometric_data JSONB DEFAULT '{}',
  session_notes TEXT,
  effectiveness_rating INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group VR Sessions
CREATE TABLE public.group_vr_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  world_id UUID REFERENCES public.vr_therapy_worlds(id),
  facilitator_type TEXT DEFAULT 'ai', -- 'ai', 'therapist'
  facilitator_id UUID, -- therapist user_id if human facilitator
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  session_data JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Group VR Participants
CREATE TABLE public.group_vr_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.group_vr_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  avatar_id UUID REFERENCES public.ai_avatars(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  participation_data JSONB DEFAULT '{}'
);

-- Mental Health Coins (Smart Rewards System)
CREATE TABLE public.mental_health_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coin_type TEXT NOT NULL, -- 'earned', 'spent', 'bonus'
  amount INTEGER NOT NULL,
  source_activity TEXT NOT NULL, -- 'meditation', 'therapy', 'quest', 'achievement'
  source_id UUID, -- Reference to specific activity
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ultra Personalization Settings
CREATE TABLE public.ultra_personalizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  auri_personality JSONB NOT NULL DEFAULT '{}',
  voice_preferences JSONB DEFAULT '{}',
  visual_preferences JSONB DEFAULT '{}',
  interaction_style JSONB DEFAULT '{}',
  mood_adaptations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily Micro-Challenges (Enhanced)
CREATE TABLE public.micro_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_type TEXT NOT NULL, -- 'breathing', 'gratitude', 'meditation', 'movement'
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER DEFAULT 60,
  instructions JSONB DEFAULT '{}',
  reward_coins INTEGER DEFAULT 5,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  effectiveness_rating INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research Contributions (Global Research Network)
CREATE TABLE public.research_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contribution_type TEXT NOT NULL, -- 'mood_data', 'usage_patterns', 'therapy_outcomes'
  anonymized_data JSONB NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  research_study_id TEXT,
  contributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Biofeedback Real-time Sessions
CREATE TABLE public.biofeedback_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'stress_reduction', 'breathing', 'meditation'
  biometric_source TEXT, -- 'apple_watch', 'fitbit', 'oura', 'manual'
  real_time_data JSONB NOT NULL DEFAULT '{}',
  ai_feedback JSONB DEFAULT '{}',
  session_duration INTEGER DEFAULT 0,
  effectiveness_score NUMERIC DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Family Supporter Enhancements
CREATE TABLE public.family_supporter_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_account_id UUID NOT NULL,
  supporter_user_id UUID NOT NULL,
  supported_user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'guidance', 'check_in', 'crisis_support'
  ai_guidance JSONB DEFAULT '{}',
  session_notes TEXT,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.vr_therapy_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_vr_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_vr_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ultra_personalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biofeedback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_supporter_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- VR Therapy Worlds - Public read
CREATE POLICY "VR worlds are viewable by everyone" 
ON public.vr_therapy_worlds 
FOR SELECT 
USING (true);

-- AI Avatars - Public read
CREATE POLICY "AI avatars are viewable by everyone" 
ON public.ai_avatars 
FOR SELECT 
USING (true);

-- User VR Sessions - User owns data
CREATE POLICY "Users can manage their own VR sessions" 
ON public.user_vr_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Group VR Sessions - Public read, authenticated create
CREATE POLICY "Group VR sessions are viewable by everyone" 
ON public.group_vr_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create group sessions" 
ON public.group_vr_sessions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Group VR Participants - User participation
CREATE POLICY "Users can manage their own participation" 
ON public.group_vr_participants 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view group participants" 
ON public.group_vr_participants 
FOR SELECT 
USING (true);

-- Mental Health Coins - User owns data
CREATE POLICY "Users can view their own coins" 
ON public.mental_health_coins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage coins" 
ON public.mental_health_coins 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ultra Personalizations - User owns data
CREATE POLICY "Users can manage their personalizations" 
ON public.ultra_personalizations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Micro Challenges - User owns data
CREATE POLICY "Users can manage their micro challenges" 
ON public.micro_challenges 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Research Contributions - User owns data
CREATE POLICY "Users can manage their research contributions" 
ON public.research_contributions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Biofeedback Sessions - User owns data
CREATE POLICY "Users can manage their biofeedback sessions" 
ON public.biofeedback_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Family Supporter Sessions - Family access
CREATE POLICY "Family members can view supporter sessions" 
ON public.family_supporter_sessions 
FOR SELECT 
USING (
  (auth.uid() = supporter_user_id) OR 
  (auth.uid() = supported_user_id) OR 
  (family_account_id IN (
    SELECT family_account_id 
    FROM profiles 
    WHERE id = auth.uid()
  ))
);

CREATE POLICY "Family supporters can create sessions" 
ON public.family_supporter_sessions 
FOR INSERT 
WITH CHECK (
  (auth.uid() = supporter_user_id) AND
  (family_account_id IN (
    SELECT family_account_id 
    FROM profiles 
    WHERE id = auth.uid()
  ))
);

-- Create indexes for performance
CREATE INDEX idx_user_vr_sessions_user_id ON public.user_vr_sessions(user_id);
CREATE INDEX idx_user_vr_sessions_world_id ON public.user_vr_sessions(world_id);
CREATE INDEX idx_group_vr_participants_session_id ON public.group_vr_participants(session_id);
CREATE INDEX idx_group_vr_participants_user_id ON public.group_vr_participants(user_id);
CREATE INDEX idx_mental_health_coins_user_id ON public.mental_health_coins(user_id);
CREATE INDEX idx_micro_challenges_user_id ON public.micro_challenges(user_id);
CREATE INDEX idx_micro_challenges_date ON public.micro_challenges(challenge_date);
CREATE INDEX idx_biofeedback_sessions_user_id ON public.biofeedback_sessions(user_id);
CREATE INDEX idx_research_contributions_user_id ON public.research_contributions(user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_vr_therapy_worlds_updated_at
  BEFORE UPDATE ON public.vr_therapy_worlds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_avatars_updated_at
  BEFORE UPDATE ON public.ai_avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ultra_personalizations_updated_at
  BEFORE UPDATE ON public.ultra_personalizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default VR therapy worlds
INSERT INTO public.vr_therapy_worlds (name, description, environment_type, world_data) VALUES
('Tranquil Beach', 'A peaceful ocean shore with gentle waves and warm sunlight', 'beach', '{"ambient_sounds": ["waves", "seagulls"], "weather": "sunny", "time_of_day": "sunset"}'),
('Mystic Forest', 'An enchanted forest with tall trees and soothing nature sounds', 'forest', '{"ambient_sounds": ["birds", "wind", "leaves"], "weather": "misty", "time_of_day": "dawn"}'),
('Mountain Peak', 'A serene mountain top with panoramic views and clear air', 'mountain', '{"ambient_sounds": ["wind", "distant_eagles"], "weather": "clear", "time_of_day": "morning"}'),
('Cosmic Journey', 'A floating meditation space among stars and galaxies', 'cosmic', '{"ambient_sounds": ["cosmic_tones", "celestial_music"], "effects": ["aurora", "shooting_stars"]}'),
('Zen Garden', 'A minimalist Japanese garden for focused meditation', 'custom', '{"ambient_sounds": ["water_fountain", "bamboo_chimes"], "elements": ["stone_path", "koi_pond"]});

-- Insert default AI avatars
INSERT INTO public.ai_avatars (name, avatar_type, personality_traits, appearance_data, voice_settings) VALUES
('Dr. Serena', 'therapist', '{"empathy": 95, "professionalism": 90, "warmth": 85}', '{"style": "professional", "age": "middle_aged", "ethnicity": "diverse"}', '{"tone": "calm", "pace": "moderate", "pitch": "medium"}'),
('Maya', 'friend', '{"supportive": 90, "encouraging": 95, "casual": 80}', '{"style": "friendly", "age": "young_adult", "ethnicity": "diverse"}', '{"tone": "warm", "pace": "natural", "pitch": "medium"}'),
('Sage', 'mentor', '{"wisdom": 95, "patience": 90, "guidance": 85}', '{"style": "wise", "age": "elder", "ethnicity": "diverse"}', '{"tone": "deep", "pace": "slow", "pitch": "low"}'),
('Little You', 'inner_child', '{"playful": 90, "innocent": 95, "curious": 85}', '{"style": "youthful", "age": "child", "ethnicity": "user_matched"}', '{"tone": "light", "pace": "energetic", "pitch": "high"}'),
('Auri Plus', 'custom', '{"adaptive": 100, "intelligent": 95, "compassionate": 90}', '{"style": "ethereal", "form": "light_being", "colors": ["purple", "blue", "white"]}', '{"tone": "adaptive", "pace": "adaptive", "pitch": "adaptive"});

-- Mental Health Coins initial setup for existing users
INSERT INTO public.mental_health_coins (user_id, coin_type, amount, source_activity, description)
SELECT 
  id as user_id,
  'bonus' as coin_type,
  100 as amount,
  'welcome_bonus' as source_activity,
  'Welcome to Ultra Patch 2.0!' as description
FROM auth.users
WHERE id IN (SELECT DISTINCT user_id FROM public.profiles)
ON CONFLICT DO NOTHING;