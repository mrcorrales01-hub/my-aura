import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration_seconds: number;
  category: string;
  mood_tags: string[];
  premium_only: boolean;
  pay_per_play_cost: number;
  file_url: string;
  cover_image_url?: string;
  description?: string;
  multilingual_metadata: any;
  ai_match_criteria: any;
  gamification_unlock_level: number;
  gamification_achievements: string[];
}

interface MusicSession {
  id: string;
  track_id: string;
  played_at: string;
  duration_played: number;
  completed: boolean;
  mood_before?: string;
  mood_after?: string;
  session_context?: string;
  payment_required: boolean;
  payment_amount: number;
}

interface MusicPlaylist {
  id: string;
  name: string;
  description?: string;
  track_ids: string[];
  is_public: boolean;
  category: string;
  ai_generated_criteria: any;
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

  // Fetch all tracks
  const fetchTracks = async (category?: string, moodTags?: string[]) => {
    try {
      setLoading(true);
      let query = supabase.from('music_tracks').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (moodTags && moodTags.length > 0) {
        query = query.overlaps('mood_tags', moodTags);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch music tracks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('music_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  // Fetch user's music sessions
  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_music_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Start music session
  const startMusicSession = async (track: MusicTrack, sessionContext?: string, moodBefore?: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_music_sessions')
        .insert({
          user_id: user.id,
          track_id: track.id,
          session_context: sessionContext,
          mood_before: moodBefore,
          payment_required: track.premium_only || track.pay_per_play_cost > 0,
          payment_amount: track.pay_per_play_cost
        });
      
      if (error) throw error;
      
      setCurrentTrack(track);
      await fetchSessions();
    } catch (error) {
      console.error('Error starting music session:', error);
      toast({
        title: "Error",
        description: "Failed to start music session",
        variant: "destructive",
      });
    }
  };

  // Complete music session
  const completeMusicSession = async (sessionId: string, durationPlayed: number, moodAfter?: string) => {
    try {
      const { error } = await supabase
        .from('user_music_sessions')
        .update({
          duration_played: durationPlayed,
          completed: true,
          mood_after: moodAfter
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      await fetchSessions();
    } catch (error) {
      console.error('Error completing music session:', error);
    }
  };

  // Create playlist
  const createPlaylist = async (name: string, description?: string, trackIds?: string[]) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('music_playlists')
        .insert({
          user_id: user.id,
          name,
          description,
          track_ids: trackIds || [],
          category: 'custom'
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Playlist created successfully",
      });
      
      await fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to create playlist",
        variant: "destructive",
      });
    }
  };

  // Get AI-recommended tracks
  const getAIRecommendations = async (mood?: string, context?: string, heartRate?: number) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase.functions.invoke('music-ai-recommendations', {
        body: {
          userId: user.id,
          mood,
          context,
          heartRate,
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

  // Get tracks by category
  const getTracksByCategory = (category: string) => {
    return tracks.filter(track => track.category === category);
  };

  // Get tracks by mood
  const getTracksByMood = (moodTags: string[]) => {
    return tracks.filter(track => 
      track.mood_tags.some(tag => moodTags.includes(tag))
    );
  };

  useEffect(() => {
    fetchTracks();
    if (user) {
      fetchPlaylists();
      fetchSessions();
    }
  }, [user]);

  return {
    tracks,
    playlists,
    sessions,
    loading,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    setCurrentTrack,
    setIsPlaying,
    setCurrentTime,
    setDuration,
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