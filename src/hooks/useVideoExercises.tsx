import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface VideoExercise {
  id: string;
  title: string;
  instructor: string;
  duration_seconds: number;
  category: string;
  difficulty_level: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  multilingual_captions: any;
  multilingual_metadata: any;
  ai_match_criteria: any;
  gamification_unlock_level: number;
  gamification_achievements: string[];
  tags: string[];
  premium_only: boolean;
}

interface VideoSession {
  id: string;
  video_id: string;
  started_at: string;
  completed_at?: string;
  duration_watched: number;
  completed: boolean;
  mood_before?: string;
  mood_after?: string;
  difficulty_rating?: number;
  effectiveness_rating?: number;
  session_notes?: string;
}

export const useVideoExercises = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoExercise[]>([]);
  const [sessions, setSessions] = useState<VideoSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoExercise | null>(null);
  const [currentSession, setCurrentSession] = useState<VideoSession | null>(null);

  // Fetch all video exercises
  const fetchVideos = async (category?: string, difficulty?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('video_exercises').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (difficulty) {
        query = query.eq('difficulty_level', difficulty);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch video exercises",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's video sessions
  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_video_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Start video session
  const startVideoSession = async (video: VideoExercise, moodBefore?: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_video_sessions')
        .insert({
          user_id: user.id,
          video_id: video.id,
          mood_before: moodBefore
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentVideo(video);
      setCurrentSession(data);
      await fetchSessions();
      
      return data;
    } catch (error) {
      console.error('Error starting video session:', error);
      toast({
        title: "Error",
        description: "Failed to start video session",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update video session progress
  const updateSessionProgress = async (sessionId: string, durationWatched: number) => {
    try {
      const { error } = await supabase
        .from('user_video_sessions')
        .update({
          duration_watched: durationWatched
        })
        .eq('id', sessionId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating session progress:', error);
    }
  };

  // Complete video session
  const completeVideoSession = async (
    sessionId: string, 
    durationWatched: number, 
    moodAfter?: string,
    difficultyRating?: number,
    effectivenessRating?: number,
    sessionNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('user_video_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_watched: durationWatched,
          completed: true,
          mood_after: moodAfter,
          difficulty_rating: difficultyRating,
          effectiveness_rating: effectivenessRating,
          session_notes: sessionNotes
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      toast({
        title: "Session Complete!",
        description: "Great job completing the exercise!",
      });
      
      await fetchSessions();
      setCurrentSession(null);
      setCurrentVideo(null);
    } catch (error) {
      console.error('Error completing video session:', error);
      toast({
        title: "Error",
        description: "Failed to complete session",
        variant: "destructive",
      });
    }
  };

  // Get AI-recommended videos
  const getAIRecommendations = async (mood?: string, goals?: string[], activityHistory?: any) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase.functions.invoke('video-ai-recommendations', {
        body: {
          userId: user.id,
          mood,
          goals,
          activityHistory,
          timeOfDay: new Date().getHours()
        }
      });
      
      if (error) throw error;
      return data.recommendations || [];
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  };

  // Get videos by category
  const getVideosByCategory = (category: string) => {
    return videos.filter(video => video.category === category);
  };

  // Get videos by difficulty
  const getVideosByDifficulty = (difficulty: string) => {
    return videos.filter(video => video.difficulty_level === difficulty);
  };

  // Get videos by tags
  const getVideosByTags = (tags: string[]) => {
    return videos.filter(video => 
      video.tags.some(tag => tags.includes(tag))
    );
  };

  // Get user's completed sessions count
  const getCompletedSessionsCount = () => {
    return sessions.filter(session => session.completed).length;
  };

  // Get user's total watch time
  const getTotalWatchTime = () => {
    return sessions.reduce((total, session) => total + session.duration_watched, 0);
  };

  // Format duration to readable string
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchVideos();
    if (user) {
      fetchSessions();
    }
  }, [user]);

  return {
    videos,
    sessions,
    loading,
    currentVideo,
    currentSession,
    setCurrentVideo,
    setCurrentSession,
    fetchVideos,
    fetchSessions,
    startVideoSession,
    updateSessionProgress,
    completeVideoSession,
    getAIRecommendations,
    getVideosByCategory,
    getVideosByDifficulty,
    getVideosByTags,
    getCompletedSessionsCount,
    getTotalWatchTime,
    formatDuration
  };
};