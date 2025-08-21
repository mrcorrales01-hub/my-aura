-- Create diagnosis compass assessments table
CREATE TABLE public.diagnosis_compass_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL, -- 'phq9', 'gad7', 'pcl5', 'aces', 'custom'
  assessment_data JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  severity_level TEXT,
  recommendations JSONB DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.diagnosis_compass_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own assessments"
ON public.diagnosis_compass_assessments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create VR therapy worlds table
CREATE TABLE public.vr_therapy_worlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  world_type TEXT NOT NULL, -- 'forest', 'ocean', 'mountain', 'space', 'garden'
  description TEXT,
  environment_data JSONB NOT NULL DEFAULT '{}',
  therapeutic_focus TEXT[], -- ['anxiety', 'depression', 'stress', 'trauma']
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INTEGER DEFAULT 10,
  premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vr_therapy_worlds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "VR worlds are viewable by everyone"
ON public.vr_therapy_worlds
FOR SELECT
USING (true);

-- Create VR therapy sessions table
CREATE TABLE public.vr_therapy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  world_id UUID REFERENCES public.vr_therapy_worlds(id),
  session_type TEXT NOT NULL, -- 'vr', 'ar', 'guided_meditation'
  session_data JSONB NOT NULL DEFAULT '{}',
  biometric_data JSONB DEFAULT '{}',
  mood_before TEXT,
  mood_after TEXT,
  stress_level_before INTEGER, -- 1-10 scale
  stress_level_after INTEGER, -- 1-10 scale
  effectiveness_rating INTEGER, -- 1-5 scale
  duration_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vr_therapy_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own VR sessions"
ON public.vr_therapy_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create relationship coaching sessions table
CREATE TABLE public.relationship_coaching_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'communication', 'conflict_resolution', 'empathy_building', 'couples_exercise'
  partner_involved BOOLEAN DEFAULT false,
  session_data JSONB NOT NULL DEFAULT '{}',
  roleplay_scenario TEXT,
  ai_feedback JSONB DEFAULT '{}',
  improvement_areas TEXT[],
  exercises_completed JSONB DEFAULT '[]',
  effectiveness_rating INTEGER, -- 1-5 scale
  duration_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relationship_coaching_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own relationship sessions"
ON public.relationship_coaching_sessions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Insert default VR therapy worlds
INSERT INTO public.vr_therapy_worlds (name, world_type, description, environment_data, therapeutic_focus, duration_minutes) VALUES
('Peaceful Forest', 'forest', 'A serene forest with gentle sounds of nature, perfect for anxiety relief', 
 '{"sounds": ["birds", "wind", "leaves"], "lighting": "soft", "weather": "calm"}', 
 ARRAY['anxiety', 'stress'], 15),
('Ocean Depths', 'ocean', 'Underwater sanctuary with flowing kelp and gentle marine life', 
 '{"sounds": ["waves", "whale_songs"], "lighting": "blue", "flow": "gentle"}', 
 ARRAY['depression', 'trauma'], 20),
('Mountain Peak', 'mountain', 'Breathtaking mountain vista for perspective and grounding exercises', 
 '{"sounds": ["wind", "eagles"], "lighting": "golden", "atmosphere": "crisp"}', 
 ARRAY['stress', 'anxiety'], 12),
('Cosmic Garden', 'space', 'Floating garden in space with ethereal beauty and zero gravity peace', 
 '{"sounds": ["cosmic_ambience"], "lighting": "starlight", "gravity": "zero"}', 
 ARRAY['depression', 'anxiety'], 25),
('Zen Garden', 'garden', 'Traditional Japanese garden with meditation areas and water features', 
 '{"sounds": ["water", "bamboo"], "lighting": "natural", "elements": ["stone", "water", "plants"]}', 
 ARRAY['stress', 'anxiety'], 10);