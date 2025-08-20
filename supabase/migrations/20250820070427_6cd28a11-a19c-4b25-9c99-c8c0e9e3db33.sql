-- AI Lifestyle Plans
CREATE TABLE public.ai_lifestyle_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  focus_areas TEXT[] NOT NULL DEFAULT '{}', -- 'sleep', 'diet', 'fitness', 'stress'
  plan_data JSONB NOT NULL DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '{}',
  progress_data JSONB DEFAULT '{}',
  wearable_sync_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safety Network
CREATE TABLE public.safety_networks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  relationship TEXT, -- 'family', 'friend', 'partner', 'therapist'
  emergency_contact BOOLEAN DEFAULT FALSE,
  crisis_notifications BOOLEAN DEFAULT TRUE,
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'declined'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Diagnosis Compass (Self-Assessments)
CREATE TABLE public.self_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'PHQ9', 'GAD7', 'ADHD', 'PTSD', etc.
  questions_answers JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER,
  severity_level TEXT, -- 'minimal', 'mild', 'moderate', 'severe'
  ai_interpretation TEXT,
  recommendations JSONB DEFAULT '[]',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_suggested_date DATE
);

-- AI Role Modes
CREATE TABLE public.ai_role_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL, -- 'coach', 'therapist', 'friend', 'mentor'
  session_data JSONB NOT NULL DEFAULT '{}',
  conversation_history JSONB DEFAULT '[]',
  effectiveness_rating INTEGER,
  mood_before TEXT,
  mood_after TEXT,
  duration_minutes INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- VR/AR Therapy Sessions
CREATE TABLE public.vr_ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'ar', 'vr'
  environment_type TEXT NOT NULL, -- 'forest', 'ocean', 'mountain', 'space'
  exercise_type TEXT, -- 'breathing', 'meditation', 'mindfulness'
  duration_minutes INTEGER,
  biometric_data JSONB DEFAULT '{}',
  effectiveness_rating INTEGER,
  session_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Financial Stress Aid
CREATE TABLE public.financial_wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_data JSONB DEFAULT '{}',
  stress_level INTEGER, -- 1-10
  financial_goals JSONB DEFAULT '[]',
  ai_recommendations JSONB DEFAULT '[]',
  progress_tracking JSONB DEFAULT '{}',
  debt_reduction_plan JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relationship Coaching
CREATE TABLE public.relationship_coaching (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'romantic', 'family', 'friendship', 'professional'
  scenario_type TEXT NOT NULL, -- 'conflict_resolution', 'communication', 'boundary_setting'
  roleplay_data JSONB DEFAULT '{}',
  ai_feedback JSONB DEFAULT '{}',
  improvement_areas TEXT[],
  effectiveness_rating INTEGER,
  practice_partner_id UUID, -- for couple exercises
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Crisis AI Line Interactions
CREATE TABLE public.crisis_ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- nullable for anonymous crisis support
  session_type TEXT NOT NULL, -- 'emergency', 'crisis', 'support'
  crisis_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'emergency'
  ai_responses JSONB DEFAULT '[]',
  user_messages JSONB DEFAULT '[]',
  escalation_triggered BOOLEAN DEFAULT FALSE,
  human_handoff_at TIMESTAMPTZ,
  geo_location TEXT, -- for localized resources
  resolved_at TIMESTAMPTZ,
  follow_up_scheduled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group Therapy Sessions (Enhanced)
CREATE TABLE public.group_therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  session_type TEXT NOT NULL, -- 'support_group', 'therapy_group', 'peer_circle'
  facilitator_type TEXT DEFAULT 'ai', -- 'ai', 'therapist', 'peer'
  facilitator_id UUID, -- therapist ID if applicable
  max_participants INTEGER DEFAULT 8,
  current_participants INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT TRUE,
  topic_focus TEXT[], -- 'anxiety', 'depression', 'grief', etc.
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  session_data JSONB DEFAULT '{}',
  ai_moderation_log JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.group_therapy_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.group_therapy_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT, -- anonymous display name
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  participation_score INTEGER, -- engagement level
  reported_issues INTEGER DEFAULT 0,
  is_muted BOOLEAN DEFAULT FALSE
);

-- Wearable Device Integration
CREATE TABLE public.wearable_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL, -- 'apple_watch', 'fitbit', 'garmin', 'google_fit'
  device_name TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'hourly', -- 'realtime', 'hourly', 'daily'
  data_types TEXT[] DEFAULT '{}', -- 'heart_rate', 'sleep', 'steps', 'stress'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.wearable_devices(id) ON DELETE SET NULL,
  data_type TEXT NOT NULL, -- 'heart_rate', 'sleep', 'steps', 'stress_level'
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT now(),
  ai_insights JSONB DEFAULT '{}'
);

-- Enable RLS for all new tables
ALTER TABLE public.ai_lifestyle_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_role_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vr_ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_coaching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_therapy_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- AI Lifestyle Plans
CREATE POLICY "Users can manage their own lifestyle plans" ON public.ai_lifestyle_plans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Safety Networks
CREATE POLICY "Users can manage their own safety networks" ON public.safety_networks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Self Assessments
CREATE POLICY "Users can manage their own assessments" ON public.self_assessments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Role Sessions
CREATE POLICY "Users can manage their own AI role sessions" ON public.ai_role_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- VR/AR Sessions
CREATE POLICY "Users can manage their own VR/AR sessions" ON public.vr_ar_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Financial Wellness
CREATE POLICY "Users can manage their own financial wellness data" ON public.financial_wellness
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Relationship Coaching
CREATE POLICY "Users can manage their own relationship coaching" ON public.relationship_coaching
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Crisis AI Sessions (allow anonymous access)
CREATE POLICY "Users can manage their own crisis sessions" ON public.crisis_ai_sessions
  FOR ALL USING (user_id IS NULL OR auth.uid() = user_id) 
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Group Therapy Sessions
CREATE POLICY "Anyone can view group therapy sessions" ON public.group_therapy_sessions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create group sessions" ON public.group_therapy_sessions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Group Therapy Participants
CREATE POLICY "Users can manage their own participation" ON public.group_therapy_participants
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can view other participants in same session" ON public.group_therapy_participants
  FOR SELECT USING (session_id IN (
    SELECT session_id FROM public.group_therapy_participants WHERE user_id = auth.uid()
  ));

-- Wearable Devices
CREATE POLICY "Users can manage their own wearable devices" ON public.wearable_devices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wearable Data
CREATE POLICY "Users can manage their own wearable data" ON public.wearable_data
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_ai_lifestyle_plans_updated_at
  BEFORE UPDATE ON public.ai_lifestyle_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_wellness_updated_at
  BEFORE UPDATE ON public.financial_wellness
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_ai_lifestyle_plans_user_id ON public.ai_lifestyle_plans(user_id);
CREATE INDEX idx_safety_networks_user_id ON public.safety_networks(user_id);
CREATE INDEX idx_self_assessments_user_id ON public.self_assessments(user_id);
CREATE INDEX idx_ai_role_sessions_user_id ON public.ai_role_sessions(user_id);
CREATE INDEX idx_vr_ar_sessions_user_id ON public.vr_ar_sessions(user_id);
CREATE INDEX idx_financial_wellness_user_id ON public.financial_wellness(user_id);
CREATE INDEX idx_relationship_coaching_user_id ON public.relationship_coaching(user_id);
CREATE INDEX idx_crisis_ai_sessions_user_id ON public.crisis_ai_sessions(user_id);
CREATE INDEX idx_group_therapy_participants_user_id ON public.group_therapy_participants(user_id);
CREATE INDEX idx_group_therapy_participants_session_id ON public.group_therapy_participants(session_id);
CREATE INDEX idx_wearable_devices_user_id ON public.wearable_devices(user_id);
CREATE INDEX idx_wearable_data_user_id ON public.wearable_data(user_id);
CREATE INDEX idx_wearable_data_recorded_at ON public.wearable_data(recorded_at);