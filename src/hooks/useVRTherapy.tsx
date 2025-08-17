import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface VRWorld {
  id: string;
  name: string;
  description: string;
  environment_type: string;
  world_data: any;
}

interface AIAvatar {
  id: string;
  name: string;
  avatar_type: string;
  personality_traits: any;
  appearance_data: any;
  voice_settings: any;
}

interface VRSession {
  id: string;
  user_id: string;
  world_id: string;
  avatar_id?: string;
  session_type: string;
  duration_minutes: number;
  biometric_data: any;
  session_notes?: string;
  effectiveness_rating?: number;
  started_at: string;
  completed_at?: string;
}

interface GroupVRSession {
  id: string;
  session_name: string;
  world_id: string;
  facilitator_type: string;
  max_participants: number;
  current_participants: number;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
}

export const useVRTherapy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [vrWorlds, setVRWorlds] = useState<VRWorld[]>([]);
  const [aiAvatars, setAIAvatars] = useState<AIAvatar[]>([]);
  const [vrSessions, setVRSessions] = useState<VRSession[]>([]);
  const [groupSessions, setGroupSessions] = useState<GroupVRSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<VRSession | null>(null);

  useEffect(() => {
    if (user) {
      fetchVRData();
    }
  }, [user]);

  const fetchVRData = async () => {
    try {
      setLoading(true);

      // Fetch VR worlds
      const { data: worlds, error: worldsError } = await supabase
        .from('vr_therapy_worlds')
        .select('*')
        .order('name');

      if (worldsError) throw worldsError;

      // Fetch AI avatars
      const { data: avatars, error: avatarsError } = await supabase
        .from('ai_avatars')
        .select('*')
        .order('name');

      if (avatarsError) throw avatarsError;

      // Fetch user's VR sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_vr_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;

      // Fetch available group sessions
      const { data: groupSessionsData, error: groupError } = await supabase
        .from('group_vr_sessions')
        .select('*')
        .or('started_at.is.null,ended_at.is.null')
        .order('scheduled_at', { ascending: true });

      if (groupError) throw groupError;

      setVRWorlds(worlds || []);
      setAIAvatars(avatars || []);
      setVRSessions(sessions || []);
      setGroupSessions(groupSessionsData || []);
    } catch (error) {
      console.error('Error fetching VR data:', error);
      toast({
        title: "Error",
        description: "Failed to load VR therapy data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startVRSession = async (
    worldId: string, 
    sessionType: string, 
    avatarId?: string
  ) => {
    if (!user) return null;

    try {
      const sessionData = {
        user_id: user.id,
        world_id: worldId,
        avatar_id: avatarId,
        session_type: sessionType,
        biometric_data: {},
        started_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_vr_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      
      toast({
        title: "VR Session Started! 🥽",
        description: `Welcome to ${vrWorlds.find(w => w.id === worldId)?.name}`,
      });

      return data;
    } catch (error) {
      console.error('Error starting VR session:', error);
      toast({
        title: "Error",
        description: "Failed to start VR session",
        variant: "destructive"
      });
      return null;
    }
  };

  const completeVRSession = async (
    sessionId: string, 
    durationMinutes: number,
    effectivenessRating?: number,
    sessionNotes?: string,
    biometricData?: any
  ) => {
    try {
      const { error } = await supabase
        .from('user_vr_sessions')
        .update({
          duration_minutes: durationMinutes,
          effectiveness_rating: effectivenessRating,
          session_notes: sessionNotes,
          biometric_data: biometricData || {},
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      setActiveSession(null);
      await fetchVRData();

      toast({
        title: "VR Session Complete! ✨",
        description: `Great work! Session lasted ${durationMinutes} minutes`,
      });

      return true;
    } catch (error) {
      console.error('Error completing VR session:', error);
      toast({
        title: "Error",
        description: "Failed to complete VR session",
        variant: "destructive"
      });
      return false;
    }
  };

  const joinGroupSession = async (sessionId: string, avatarId?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('group_vr_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          avatar_id: avatarId,
          participation_data: {}
        });

      if (error) throw error;

      // Update participant count
      // Increment participant count
      const { data: session } = await supabase
        .from('group_vr_sessions')
        .select('current_participants')
        .eq('id', sessionId)
        .single();
      
      if (session) {
        await supabase
          .from('group_vr_sessions')
          .update({ 
            current_participants: (session.current_participants || 0) + 1 
          })
          .eq('id', sessionId);
      }

      await fetchVRData();

      toast({
        title: "Joined Group Session! 👥",
        description: "Welcome to the group VR experience",
      });

      return true;
    } catch (error) {
      console.error('Error joining group session:', error);
      toast({
        title: "Error",
        description: "Failed to join group session",
        variant: "destructive"
      });
      return false;
    }
  };

  const getWorldsByType = (type: string) => {
    return vrWorlds.filter(world => world.environment_type === type);
  };

  const getAvatarsByType = (type: string) => {
    return aiAvatars.filter(avatar => avatar.avatar_type === type);
  };

  const getSessionStats = () => {
    const totalSessions = vrSessions.length;
    const totalMinutes = vrSessions.reduce((sum, session) => sum + session.duration_minutes, 0);
    const avgRating = vrSessions.length > 0 
      ? vrSessions.reduce((sum, session) => sum + (session.effectiveness_rating || 0), 0) / vrSessions.length
      : 0;

    return {
      totalSessions,
      totalMinutes,
      avgRating: Math.round(avgRating * 10) / 10
    };
  };

  return {
    vrWorlds,
    aiAvatars,
    vrSessions,
    groupSessions,
    activeSession,
    loading,
    startVRSession,
    completeVRSession,
    joinGroupSession,
    getWorldsByType,
    getAvatarsByType,
    getSessionStats,
    fetchVRData
  };
};