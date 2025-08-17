-- Create achievements table for gamification
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text NOT NULL, -- 'quest', 'roleplay', 'mood', 'streak', etc.
  badge_icon text, -- emoji or icon name
  badge_color text DEFAULT '#6366f1',
  requirements jsonb NOT NULL DEFAULT '{}', -- criteria to unlock
  points integer DEFAULT 0,
  is_secret boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add gamification columns to user_achievements
ALTER TABLE public.user_achievements 
ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0;

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

-- Allow system to insert achievements
CREATE POLICY "System can insert achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update user_achievements policies to handle gamification
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to award achievement
CREATE OR REPLACE FUNCTION public.award_achievement(
  p_user_id uuid,
  p_achievement_name text,
  p_points integer DEFAULT 0
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record public.achievements%ROWTYPE;
  existing_record public.user_achievements%ROWTYPE;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record 
  FROM public.achievements 
  WHERE name = p_achievement_name;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if user already has this achievement
  SELECT * INTO existing_record
  FROM public.user_achievements
  WHERE user_id = p_user_id AND achievement_name = p_achievement_name;
  
  IF FOUND THEN
    RETURN false; -- Already has achievement
  END IF;
  
  -- Award the achievement
  INSERT INTO public.user_achievements (
    user_id,
    achievement_name,
    achievement_type,
    description,
    points_earned,
    total_xp
  ) VALUES (
    p_user_id,
    achievement_record.name,
    achievement_record.category,
    achievement_record.description,
    COALESCE(p_points, achievement_record.points),
    COALESCE(p_points, achievement_record.points)
  );
  
  -- Update user's total XP
  UPDATE public.user_achievements 
  SET total_xp = total_xp + COALESCE(p_points, achievement_record.points)
  WHERE user_id = p_user_id;
  
  RETURN true;
END;
$$;

-- Insert default achievements
INSERT INTO public.achievements (name, description, category, badge_icon, points, requirements) VALUES
('First Steps', 'Complete your first quest', 'quest', '🌱', 10, '{"quests_completed": 1}'),
('Conversation Starter', 'Complete your first roleplay scenario', 'roleplay', '💬', 15, '{"roleplay_sessions": 1}'),
('Mood Tracker', 'Log your mood for 3 consecutive days', 'mood', '😊', 20, '{"mood_streak": 3}'),
('Weekly Warrior', 'Complete 7 quests in a week', 'quest', '⚔️', 50, '{"weekly_quests": 7}'),
('Mood Master', 'Log your mood for 30 consecutive days', 'mood', '🎯', 100, '{"mood_streak": 30}'),
('Roleplay Expert', 'Complete 10 roleplay scenarios', 'roleplay', '🎭', 75, '{"roleplay_sessions": 10}'),
('Quest Champion', 'Complete 50 quests total', 'quest', '👑', 150, '{"total_quests": 50}'),
('Social Butterfly', 'Practice 5 different roleplay scenarios', 'roleplay', '🦋', 60, '{"unique_scenarios": 5}')
ON CONFLICT (name) DO NOTHING;