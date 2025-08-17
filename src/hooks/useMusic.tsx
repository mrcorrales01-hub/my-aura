import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  mood_tags: string[];
  duration_seconds: number;
  file_url: string;
  cover_image_url?: string;
  audio_waveform_meta?: any;
  premium_only: boolean;
  license_type: string;
  royalty_ppp: number;
  category: string;
  locale_meta?: any;
  gamification_unlock_level: number;
  gamification_achievements: string[];
  multilingual_metadata?: any;
  ai_match_criteria?: any;
  pay_per_play_cost: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MusicSession {
  id: string;
  user_id: string;
  track_id: string;
  started_at: string;
  completed_at?: string;
  duration_played: number;
  completed: boolean;
  mood_before?: string;
  mood_after?: string;
  session_context: string;
  sleep_timer_duration?: number;
  revenue_cents: number;
  device?: string;
  locale: string;
  played_at: string;
}

export interface MusicPlaylist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  track_ids: string[];
  category?: string;
  is_public: boolean;
  ai_generated_criteria?: any;
  created_at: string;
  updated_at: string;
}

export const useMusic = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [playlists, setPlaylists] = useState<MusicPlaylist[]>([]);
  const [sessions, setSessions] = useState<MusicSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSession, setCurrentSession] = useState<MusicSession | null>(null);

  // Fetch all tracks
  const fetchTracks = useCallback(async (category?: string, moodFilter?: string) => {
    setLoading(true);
    try {
      let query = supabase.from('music_tracks').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (moodFilter) {
        query = query.contains('mood_tags', [moodFilter]);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setTracks((data || []).map(track => ({
        ...track,
        license_type: (track as any).license_type || 'standard',
        royalty_ppp: (track as any).royalty_ppp || 0
      })) as MusicTrack[]);
    } catch (error: any) {
      toast({
        title: "Error fetching music tracks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user playlists
  const fetchPlaylists = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('music_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlaylists(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching playlists",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Fetch user sessions
  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_music_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setSessions((data || []).map(session => ({
        ...session,
        started_at: (session as any).started_at || (session as any).played_at,
        revenue_cents: (session as any).revenue_cents || (session as any).payment_amount || 0,
        locale: (session as any).locale || 'en'
      })) as MusicSession[]);
    } catch (error: any) {
      toast({
        title: "Error fetching music sessions",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Start a music session
  const startMusicSession = useCallback(async (track: MusicTrack, moodBefore?: string) => {
    if (!user) return null;
    
    try {
      const sessionData = {
        user_id: user.id,
        track_id: track.id,
        mood_before: moodBefore,
        session_context: 'general',
        device: 'web',
        locale: 'en'
      };

      const { data, error } = await supabase
        .from('user_music_sessions')
        .insert(sessionData)
        .select()
        .single();
      
      if (error) throw error;
      
      setCurrentSession({
        ...data,
        started_at: (data as any).started_at || (data as any).played_at,
        revenue_cents: (data as any).revenue_cents || (data as any).payment_amount || 0,
        locale: (data as any).locale || 'en'
      } as MusicSession);
      setCurrentTrack(track);
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error starting music session",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Complete a music session
  const completeMusicSession = useCallback(async (
    sessionId: string,
    durationPlayed: number,
    moodAfter?: string
  ) => {
    if (!user) return;
    
    try {
      const completionPercentage = currentTrack ? (durationPlayed / currentTrack.duration_seconds) * 100 : 0;
      const isCompleted = completionPercentage >= 60; // Consider 60%+ as completed
      
      const updateData = {
        completed_at: new Date().toISOString(),
        duration_played: durationPlayed,
        completed: isCompleted,
        mood_after: moodAfter,
        revenue_cents: isCompleted && currentTrack?.royalty_ppp ? currentTrack.royalty_ppp : 0
      };

      const { error } = await supabase
        .from('user_music_sessions')
        .update(updateData)
        .eq('id', sessionId);
      
      if (error) throw error;
      
      // Award gamification points if completed
      if (isCompleted && durationPlayed >= 600) { // 10+ minutes
        await supabase.functions.invoke('wellness-gamification', {
          body: {
            userId: user.id,
            action: 'complete_music_session',
            data: {
              sessionId,
              durationMinutes: Math.floor(durationPlayed / 60),
              category: currentTrack?.category
            }
          }
        });
      }
      
      setCurrentSession(null);
      await fetchSessions();
      
      toast({
        title: "Session completed",
        description: isCompleted ? "Great job! You've earned XP for completing this session." : "Session saved",
      });
    } catch (error: any) {
      toast({
        title: "Error completing session",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [user, currentTrack, fetchSessions, toast]);

  // Create a new playlist
  const createPlaylist = useCallback(async (name: string, description?: string, trackIds: string[] = []) => {
    if (!user) return null;
    
    try {
      const playlistData = {
        user_id: user.id,
        name,
        description,
        track_ids: trackIds,
        is_public: false
      };

      const { data, error } = await supabase
        .from('music_playlists')
        .insert(playlistData)
        .select()
        .single();
      
      if (error) throw error;
      
      await fetchPlaylists();
      
      // Award achievement for creating first playlist
      await supabase.functions.invoke('wellness-gamification', {
        body: {
          userId: user.id,
          action: 'create_playlist',
          data: { playlistId: data.id }
        }
      });
      
      toast({
        title: "Playlist created",
        description: `"${name}" has been created successfully`,
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating playlist",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchPlaylists, toast]);

  // Get AI recommendations
  const getAIRecommendations = useCallback(async (
    mood?: string,
    context?: string,
    heartRate?: number,
    timeOfDay?: number
  ) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase.functions.invoke('music-ai-recommendations', {
        body: {
          userId: user.id,
          mood,
          context,
          heartRate,
          timeOfDay
        }
      });
      
      if (error) throw error;
      return data.recommendations || [];
    } catch (error: any) {
      toast({
        title: "Error getting recommendations",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  }, [user, toast]);

  // Filter functions
  const getTracksByCategory = useCallback((category: string) => {
    return tracks.filter(track => track.category === category);
  }, [tracks]);

  const getTracksByMood = useCallback((mood: string) => {
    return tracks.filter(track => track.mood_tags.includes(mood));
  }, [tracks]);

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchTracks();
      fetchPlaylists();
      fetchSessions();
    }
  }, [user, fetchTracks, fetchPlaylists, fetchSessions]);

  return {
    // State
    tracks,
    playlists,
    sessions,
    loading,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    currentSession,
    
    // Setters
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setCurrentTrack,
    
    // Functions
    fetchTracks,
    fetchPlaylists,
    fetchSessions,
    startMusicSession,
    completeMusicSession,
    createPlaylist,
    getAIRecommendations,
    getTracksByCategory,
    getTracksByMood
  };
};