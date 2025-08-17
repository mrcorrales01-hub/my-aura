-- Create tables for Harmonious Music Module
CREATE TABLE public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT,
  duration_seconds INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'meditation', 'relaxation', 'sleep', 'journaling'
  mood_tags TEXT[] DEFAULT '{}',
  premium_only BOOLEAN DEFAULT false,
  pay_per_play_cost INTEGER DEFAULT 0, -- in cents
  file_url TEXT NOT NULL,
  cover_image_url TEXT,
  description TEXT,
  multilingual_metadata JSONB DEFAULT '{}', -- titles/descriptions in different languages
  ai_match_criteria JSONB DEFAULT '{}', -- mood, heart rate, stress level matching
  gamification_unlock_level INTEGER DEFAULT 1,
  gamification_achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user music interactions table
CREATE TABLE public.user_music_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id),
  played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_played INTEGER NOT NULL DEFAULT 0, -- seconds played
  completed BOOLEAN DEFAULT false,
  mood_before TEXT,
  mood_after TEXT,
  session_context TEXT, -- 'meditation', 'journaling', 'sleep'
  payment_required BOOLEAN DEFAULT false,
  payment_amount INTEGER DEFAULT 0
);

-- Create video exercises table
CREATE TABLE public.video_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  instructor TEXT,
  duration_seconds INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'mindfulness', 'breathing', 'stretching', 'journaling'
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  multilingual_captions JSONB DEFAULT '{}', -- captions in different languages
  multilingual_metadata JSONB DEFAULT '{}', -- titles/descriptions in different languages
  ai_match_criteria JSONB DEFAULT '{}', -- mood, goals, activity history matching
  gamification_unlock_level INTEGER DEFAULT 1,
  gamification_achievements TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  premium_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user video sessions table
CREATE TABLE public.user_video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.video_exercises(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_watched INTEGER NOT NULL DEFAULT 0, -- seconds watched
  completed BOOLEAN DEFAULT false,
  mood_before TEXT,
  mood_after TEXT,
  difficulty_rating INTEGER, -- 1-5 user rating of difficulty
  effectiveness_rating INTEGER, -- 1-5 user rating of effectiveness
  session_notes TEXT
);

-- Create music playlists table
CREATE TABLE public.music_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  track_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  category TEXT, -- 'custom', 'ai_generated', 'mood_based'
  ai_generated_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_tracks (public read)
CREATE POLICY "Music tracks are viewable by everyone" 
ON public.music_tracks 
FOR SELECT 
USING (true);

-- RLS Policies for user_music_sessions
CREATE POLICY "Users can manage their own music sessions" 
ON public.user_music_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for video_exercises (public read)
CREATE POLICY "Video exercises are viewable by everyone" 
ON public.video_exercises 
FOR SELECT 
USING (true);

-- RLS Policies for user_video_sessions
CREATE POLICY "Users can manage their own video sessions" 
ON public.user_video_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for music_playlists
CREATE POLICY "Users can view public playlists and their own" 
ON public.music_playlists 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlists" 
ON public.music_playlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.music_playlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.music_playlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_music_tracks_category ON public.music_tracks(category);
CREATE INDEX idx_music_tracks_mood_tags ON public.music_tracks USING GIN(mood_tags);
CREATE INDEX idx_music_tracks_premium ON public.music_tracks(premium_only);
CREATE INDEX idx_user_music_sessions_user_id ON public.user_music_sessions(user_id);
CREATE INDEX idx_user_music_sessions_track_id ON public.user_music_sessions(track_id);
CREATE INDEX idx_video_exercises_category ON public.video_exercises(category);
CREATE INDEX idx_video_exercises_difficulty ON public.video_exercises(difficulty_level);
CREATE INDEX idx_video_exercises_premium ON public.video_exercises(premium_only);
CREATE INDEX idx_user_video_sessions_user_id ON public.user_video_sessions(user_id);
CREATE INDEX idx_user_video_sessions_video_id ON public.user_video_sessions(video_id);
CREATE INDEX idx_music_playlists_user_id ON public.music_playlists(user_id);

-- Insert some sample music tracks
INSERT INTO public.music_tracks (title, artist, duration_seconds, category, mood_tags, description, ai_match_criteria, file_url) VALUES
('Peaceful Forest', 'Serenity Sounds', 600, 'meditation', ARRAY['calm', 'peaceful', 'nature'], 'Gentle forest sounds for deep meditation', '{"mood": ["calm", "peaceful"], "stress_level": "high"}', 'https://example.com/peaceful-forest.mp3'),
('Ocean Waves', 'Tranquil Audio', 900, 'sleep', ARRAY['relaxing', 'calm', 'sleep'], 'Soothing ocean waves for better sleep', '{"mood": ["tired", "stressed"], "time_of_day": "evening"}', 'https://example.com/ocean-waves.mp3'),
('Morning Clarity', 'Mindful Melodies', 480, 'journaling', ARRAY['focused', 'creative', 'morning'], 'Inspiring music for morning journaling', '{"mood": ["content", "motivated"], "time_of_day": "morning"}', 'https://example.com/morning-clarity.mp3'),
('Deep Relaxation', 'Wellness Waves', 720, 'relaxation', ARRAY['stress-relief', 'calm', 'healing'], 'Professional relaxation track for stress relief', '{"mood": ["anxious", "stressed"], "heart_rate": "high"}', 'https://example.com/deep-relaxation.mp3');

-- Insert some sample video exercises
INSERT INTO public.video_exercises (title, instructor, duration_seconds, category, difficulty_level, description, ai_match_criteria, video_url) VALUES
('5-Minute Morning Breathing', 'Dr. Sarah Chen', 300, 'breathing', 'beginner', 'Simple breathing exercise to start your day with clarity', '{"mood": ["anxious", "stressed"], "time_of_day": "morning"}', 'https://example.com/morning-breathing.mp4'),
('Gentle Neck Stretches', 'Alex Martinez', 240, 'stretching', 'beginner', 'Relief for neck tension from desk work', '{"mood": ["tired", "stressed"], "context": "work"}', 'https://example.com/neck-stretches.mp4'),
('Mindful Body Scan', 'Maya Patel', 480, 'mindfulness', 'intermediate', 'Progressive relaxation technique for full-body awareness', '{"mood": ["anxious", "overwhelmed"], "stress_level": "high"}', 'https://example.com/body-scan.mp4'),
('Journaling Prompts', 'Emma Thompson', 180, 'journaling', 'beginner', 'Guided prompts to unlock your thoughts and feelings', '{"mood": ["confused", "contemplative"], "activity": "journaling"}', 'https://example.com/journaling-prompts.mp4'),
('Advanced Meditation', 'Zen Master Li', 900, 'mindfulness', 'advanced', 'Deep meditation practice for experienced practitioners', '{"meditation_experience": "high", "session_length": "long"}', 'https://example.com/advanced-meditation.mp4');