-- Create music and video tables for the new modules
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  mood_tags TEXT[] DEFAULT '{}',
  duration_seconds INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  cover_image_url TEXT,
  audio_waveform_meta JSONB DEFAULT '{}',
  premium_only BOOLEAN DEFAULT false,
  license_type TEXT DEFAULT 'standard',
  royalty_ppp INTEGER DEFAULT 0, -- pay per play cost in cents
  category TEXT NOT NULL,
  locale_meta JSONB DEFAULT '{}', -- multilingual metadata
  gamification_unlock_level INTEGER DEFAULT 1,
  gamification_achievements TEXT[] DEFAULT '{}',
  multilingual_metadata JSONB DEFAULT '{}',
  ai_match_criteria JSONB DEFAULT '{}',
  pay_per_play_cost INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.music_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  track_ids UUID[] DEFAULT '{}',
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  ai_generated_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_music_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES public.music_tracks(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_played INTEGER DEFAULT 0, -- seconds played
  completed BOOLEAN DEFAULT false,
  mood_before TEXT,
  mood_after TEXT,
  session_context TEXT DEFAULT 'general', -- general, sleep, focus, etc.
  sleep_timer_duration INTEGER, -- minutes if sleep timer was used
  revenue_cents INTEGER DEFAULT 0,
  device TEXT,
  locale TEXT DEFAULT 'en',
  played_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.video_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- mindfulness, breathing, stretch, etc.
  difficulty TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  duration_seconds INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  captions_map JSONB DEFAULT '{}', -- language -> caption file URL
  voiceover_map JSONB DEFAULT '{}', -- language -> voiceover file URL  
  premium_only BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  locale_meta JSONB DEFAULT '{}',
  description TEXT,
  instructor_name TEXT,
  equipment_needed TEXT,
  target_mood TEXT[],
  multilingual_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.user_video_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.video_exercises(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_watched INTEGER DEFAULT 0, -- seconds watched
  completed BOOLEAN DEFAULT false,
  mood_before TEXT,
  mood_after TEXT,
  effectiveness_rating INTEGER, -- 1-5 rating
  session_notes TEXT,
  device TEXT,
  locale TEXT DEFAULT 'en'
);

-- Enable Row Level Security
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_tracks (public read access)
CREATE POLICY "Music tracks are viewable by everyone" 
ON public.music_tracks 
FOR SELECT 
USING (true);

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

-- RLS Policies for user_music_sessions
CREATE POLICY "Users can manage their own music sessions" 
ON public.user_music_sessions 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for video_exercises (public read access)
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

-- Create triggers for updated_at columns
CREATE TRIGGER update_music_tracks_updated_at
  BEFORE UPDATE ON public.music_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_music_playlists_updated_at
  BEFORE UPDATE ON public.music_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_exercises_updated_at
  BEFORE UPDATE ON public.video_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for music tracks
INSERT INTO public.music_tracks (title, artist, mood_tags, duration_seconds, file_url, cover_image_url, category, premium_only, royalty_ppp, description, ai_match_criteria) VALUES
('Ocean Waves', 'Nature Sounds', ARRAY['calm', 'relaxing', 'sleep'], 600, '/audio/ocean-waves.mp3', '/images/ocean-cover.jpg', 'relax', false, 0, 'Gentle ocean waves for deep relaxation', '{"mood": ["calm", "stressed", "anxious"], "time_of_day": "evening", "heart_rate": "any"}'),
('Forest Rain', 'Ambient Collective', ARRAY['peaceful', 'grounding', 'focus'], 720, '/audio/forest-rain.mp3', '/images/forest-cover.jpg', 'focus', false, 0, 'Light rain in the forest for concentration', '{"mood": ["neutral", "overwhelmed"], "time_of_day": "any", "heart_rate": "high"}'),
('Deep Sleep Meditation', 'Sleep Academy', ARRAY['sleep', 'bedtime', 'calm'], 1200, '/audio/deep-sleep.mp3', '/images/sleep-cover.jpg', 'sleep', true, 25, 'Guided sleep meditation with binaural beats', '{"mood": ["tired", "restless"], "time_of_day": "night", "heart_rate": "any"}'),
('Morning Energy', 'Uplift Studios', ARRAY['energizing', 'morning', 'uplifting'], 300, '/audio/morning-energy.mp3', '/images/sunrise-cover.jpg', 'focus', true, 15, 'Energizing sounds to start your day', '{"mood": ["low_energy", "neutral"], "time_of_day": "morning", "heart_rate": "low"}'),
('Breathing Space', 'Mindful Audio', ARRAY['breathing', 'meditation', 'calm'], 480, '/audio/breathing-space.mp3', '/images/breath-cover.jpg', 'grounding', false, 0, 'Gentle tones for breathing exercises', '{"mood": ["anxious", "stressed"], "time_of_day": "any", "heart_rate": "high"}'),
('Journal Flow', 'Creative Minds', ARRAY['journaling', 'reflection', 'soft'], 900, '/audio/journal-flow.mp3', '/images/journal-cover.jpg', 'journaling', true, 20, 'Soft ambient music for journaling sessions', '{"mood": ["contemplative", "neutral"], "time_of_day": "any", "heart_rate": "any"}');

-- Insert seed data for video exercises
INSERT INTO public.video_exercises (title, category, difficulty, duration_seconds, video_url, thumbnail_url, tags, description, instructor_name, target_mood, multilingual_metadata) VALUES
('Box Breathing Basics', 'breathing', 'beginner', 180, '/videos/box-breathing.mp4', '/images/breathing-thumb.jpg', ARRAY['anxiety', 'stress', 'quick'], '3-minute guided box breathing exercise', 'Dr. Sarah Chen', ARRAY['anxious', 'stressed'], '{"captions": {"en": "/captions/box-breathing-en.vtt"}, "voices": {"en": "/audio/box-breathing-voice-en.mp3"}}'),
('Morning Mindful Stretch', 'stretch', 'beginner', 300, '/videos/morning-stretch.mp4', '/images/stretch-thumb.jpg', ARRAY['morning', 'energy', 'body'], '5-minute gentle morning stretches', 'Maya Rodriguez', ARRAY['low_energy', 'neutral'], '{"captions": {"en": "/captions/morning-stretch-en.vtt"}, "voices": {"en": "/audio/morning-stretch-voice-en.mp3"}}'),
('Quick Anxiety Relief', 'mindfulness', 'beginner', 240, '/videos/anxiety-relief.mp4', '/images/anxiety-thumb.jpg', ARRAY['anxiety', 'emergency', 'grounding'], '4-minute grounding technique for anxiety', 'James Wilson', ARRAY['anxious', 'overwhelmed'], '{"captions": {"en": "/captions/anxiety-relief-en.vtt"}, "voices": {"en": "/audio/anxiety-relief-voice-en.mp3"}}'),
('Sleep Preparation', 'sleep', 'beginner', 420, '/videos/sleep-prep.mp4', '/images/sleep-thumb.jpg', ARRAY['sleep', 'bedtime', 'relaxation'], '7-minute bedtime relaxation routine', 'Luna Singh', ARRAY['restless', 'tired'], '{"captions": {"en": "/captions/sleep-prep-en.vtt"}, "voices": {"en": "/audio/sleep-prep-voice-en.mp3"}}'),
('Focus Reset', 'mindfulness', 'intermediate', 360, '/videos/focus-reset.mp4', '/images/focus-thumb.jpg', ARRAY['focus', 'productivity', 'clarity'], '6-minute meditation to restore focus', 'Alex Kim', ARRAY['distracted', 'overwhelmed'], '{"captions": {"en": "/captions/focus-reset-en.vtt"}, "voices": {"en": "/audio/focus-reset-voice-en.mp3"}}'),
('Body Scan Relaxation', 'mindfulness', 'intermediate', 480, '/videos/body-scan.mp4', '/images/bodyscan-thumb.jpg', ARRAY['relaxation', 'stress', 'body'], '8-minute progressive body scan', 'Emma Thompson', ARRAY['stressed', 'tense'], '{"captions": {"en": "/captions/body-scan-en.vtt"}, "voices": {"en": "/audio/body-scan-voice-en.mp3"}}');

-- Create indexes for better performance
CREATE INDEX idx_music_tracks_category ON public.music_tracks(category);
CREATE INDEX idx_music_tracks_mood_tags ON public.music_tracks USING GIN(mood_tags);
CREATE INDEX idx_music_tracks_premium ON public.music_tracks(premium_only);
CREATE INDEX idx_user_music_sessions_user_track ON public.user_music_sessions(user_id, track_id);
CREATE INDEX idx_user_music_sessions_played_at ON public.user_music_sessions(played_at);
CREATE INDEX idx_video_exercises_category ON public.video_exercises(category);
CREATE INDEX idx_video_exercises_difficulty ON public.video_exercises(difficulty);
CREATE INDEX idx_video_exercises_tags ON public.video_exercises USING GIN(tags);
CREATE INDEX idx_user_video_sessions_user_video ON public.user_video_sessions(user_id, video_id);