-- Add age-based profiles and family relationships
ALTER TABLE public.profiles 
ADD COLUMN age_group text DEFAULT 'adult',
ADD COLUMN birth_year integer,
ADD COLUMN language_preference text DEFAULT 'en',
ADD COLUMN family_account_id uuid,
ADD COLUMN relationship_type text; -- 'child', 'teen', 'adult', 'parent', 'partner'

-- Create family accounts table
CREATE TABLE public.family_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'family', -- 'family', 'couple'
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  settings jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.family_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for family accounts
CREATE POLICY "Family members can view their family account"
ON public.family_accounts
FOR SELECT
USING (
  created_by = auth.uid() OR
  id IN (
    SELECT family_account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can create family accounts"
ON public.family_accounts
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family creators can update their accounts"
ON public.family_accounts
FOR UPDATE
USING (auth.uid() = created_by);

-- Create AI predictions table
CREATE TABLE public.ai_predictions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  prediction_type text NOT NULL, -- 'therapy_step', 'exercise', 'mood_forecast'
  content text NOT NULL,
  confidence_score decimal(3,2), -- 0.00 to 1.00
  based_on_data jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending', -- 'pending', 'accepted', 'dismissed'
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for AI predictions
CREATE POLICY "Users can view their own predictions"
ON public.ai_predictions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert predictions"
ON public.ai_predictions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own predictions"
ON public.ai_predictions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create family session logs
CREATE TABLE public.family_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  family_account_id uuid NOT NULL,
  session_type text NOT NULL, -- 'couple', 'family', 'parent_child'
  participants jsonb NOT NULL DEFAULT '[]'::jsonb, -- array of user_ids
  issue_description text,
  ai_suggestions jsonb DEFAULT '[]'::jsonb,
  exercises_completed jsonb DEFAULT '[]'::jsonb,
  mood_scores jsonb DEFAULT '{}'::jsonb, -- user_id -> mood_score mapping
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  notes text
);

-- Enable RLS
ALTER TABLE public.family_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for family sessions
CREATE POLICY "Family members can view their sessions"
ON public.family_sessions
FOR SELECT
USING (
  family_account_id IN (
    SELECT family_account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ) OR
  family_account_id IN (
    SELECT id 
    FROM public.family_accounts 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Family members can create sessions"
ON public.family_sessions
FOR INSERT
WITH CHECK (
  family_account_id IN (
    SELECT family_account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ) OR
  family_account_id IN (
    SELECT id 
    FROM public.family_accounts 
    WHERE created_by = auth.uid()
  )
);

CREATE POLICY "Family members can update their sessions"
ON public.family_sessions
FOR UPDATE
USING (
  family_account_id IN (
    SELECT family_account_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  ) OR
  family_account_id IN (
    SELECT id 
    FROM public.family_accounts 
    WHERE created_by = auth.uid()
  )
);

-- Create translation history table
CREATE TABLE public.translation_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  original_text text NOT NULL,
  translated_text text NOT NULL,
  source_language text NOT NULL,
  target_language text NOT NULL,
  context text, -- 'chat', 'video', 'session_notes'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for translation history
CREATE POLICY "Users can view their own translation history"
ON public.translation_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create translation history"
ON public.translation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create child activities table for gamified features
CREATE TABLE public.child_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL, -- 'emotion_drawing', 'mood_game', 'story_creation'
  activity_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  completion_status text DEFAULT 'in_progress', -- 'in_progress', 'completed', 'reviewed'
  points_earned integer DEFAULT 0,
  feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.child_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for child activities
CREATE POLICY "Users can manage their own activities"
ON public.child_activities
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_family_accounts_updated_at
  BEFORE UPDATE ON public.family_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_family_accounts_created_by ON public.family_accounts(created_by);
CREATE INDEX idx_ai_predictions_user_id ON public.ai_predictions(user_id);
CREATE INDEX idx_ai_predictions_status ON public.ai_predictions(status);
CREATE INDEX idx_family_sessions_family_account_id ON public.family_sessions(family_account_id);
CREATE INDEX idx_translation_history_user_id ON public.translation_history(user_id);
CREATE INDEX idx_child_activities_user_id ON public.child_activities(user_id);
CREATE INDEX idx_profiles_family_account_id ON public.profiles(family_account_id);
CREATE INDEX idx_profiles_age_group ON public.profiles(age_group);