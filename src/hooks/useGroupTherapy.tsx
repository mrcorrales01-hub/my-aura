import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface GroupTherapySession {
  id: string;
  session_name: string;
  session_type: 'support_group' | 'therapy_group' | 'peer_circle';
  facilitator_type: 'ai' | 'therapist' | 'peer';
  facilitator_id?: string;
  max_participants: number;
  current_participants: number;
  is_anonymous: boolean;
  topic_focus: string[];
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  session_data: any;
  ai_moderation_log: any[];
  created_at: string;
}

export interface GroupParticipant {
  id: string;
  session_id: string;
  user_id: string;
  display_name?: string;
  joined_at: string;
  left_at?: string;
  participation_score?: number;
  reported_issues: number;
  is_muted: boolean;
}

export const useGroupTherapy = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<GroupTherapySession[]>([]);
  const [joinedSessions, setJoinedSessions] = useState<GroupTherapySession[]>([]);
  const [currentSession, setCurrentSession] = useState<GroupTherapySession | null>(null);
  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  const sessionTopics = [
    { id: 'anxiety', label: 'Anxiety Support', description: 'Share strategies for managing anxiety' },
    { id: 'depression', label: 'Depression Support', description: 'Support for depression and mood disorders' },
    { id: 'grief', label: 'Grief & Loss', description: 'Processing grief and loss together' },
    { id: 'addiction', label: 'Addiction Recovery', description: 'Support for addiction recovery journey' },
    { id: 'trauma', label: 'Trauma Support', description: 'Healing from traumatic experiences' },
    { id: 'relationships', label: 'Relationship Issues', description: 'Navigating relationship challenges' },
    { id: 'work_stress', label: 'Work Stress', description: 'Managing workplace stress and burnout' },
    { id: 'parenting', label: 'Parenting Support', description: 'Support for parents and caregivers' }
  ];

  useEffect(() => {
    fetchAvailableSessions();
    if (user) {
      fetchJoinedSessions();
    }
  }, [user]);

  const fetchAvailableSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_therapy_sessions')
        .select('*')
        .is('ended_at', null)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSessions(data as GroupTherapySession[] || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch group sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_therapy_participants')
        .select(`
          *,
          group_therapy_sessions (*)
        `)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) throw error;

      const sessions = data?.map(p => p.group_therapy_sessions).filter(Boolean) as GroupTherapySession[] || [];
      setJoinedSessions(sessions);
    } catch (error: any) {
      console.error('Error fetching joined sessions:', error);
    }
  };

  const createSession = async (
    name: string,
    type: 'support_group' | 'therapy_group' | 'peer_circle',
    topicFocus: string[],
    maxParticipants: number = 8,
    scheduledAt?: string
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_therapy_sessions')
        .insert({
          session_name: name,
          session_type: type,
          facilitator_type: 'ai',
          max_participants: maxParticipants,
          current_participants: 0,
          is_anonymous: true,
          topic_focus: topicFocus,
          scheduled_at: scheduledAt,
          session_data: {
            rules: [
              'Respect confidentiality',
              'Be supportive and non-judgmental',
              'Share only what you\'re comfortable with',
              'Listen actively to others'
            ],
            ai_guidelines: {
              intervention_triggers: ['crisis_language', 'safety_concerns'],
              moderation_level: 'moderate',
              support_prompts: true
            }
          },
          ai_moderation_log: []
        })
        .select()
        .single();

      if (error) throw error;

      await fetchAvailableSessions();
      
      toast({
        title: 'Session Created',
        description: 'Your group therapy session has been created successfully!'
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create group session',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId: string, displayName?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Check if already joined
      const { data: existing } = await supabase
        .from('group_therapy_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (existing) {
        toast({
          title: 'Already Joined',
          description: 'You are already a participant in this session'
        });
        return;
      }

      // Join session
      const { error: joinError } = await supabase
        .from('group_therapy_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          display_name: displayName || `Anonymous${Math.floor(Math.random() * 1000)}`,
          participation_score: 0,
          reported_issues: 0,
          is_muted: false
        });

      if (joinError) throw joinError;

      // Update participant count
      const { error: updateError } = await supabase
        .from('group_therapy_sessions')
        .update({ 
          current_participants: sessions.find(s => s.id === sessionId)?.current_participants + 1 || 1 
        })
        .eq('id', sessionId);

      if (updateError) console.error('Error updating participant count:', updateError);

      await fetchAvailableSessions();
      await fetchJoinedSessions();
      
      toast({
        title: 'Joined Session',
        description: 'You have successfully joined the group session!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to join group session',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const leaveSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_therapy_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update participant count
      const session = sessions.find(s => s.id === sessionId);
      await supabase
        .from('group_therapy_sessions')
        .update({ 
          current_participants: Math.max(0, (session?.current_participants || 1) - 1)
        })
        .eq('id', sessionId);

      await fetchAvailableSessions();
      await fetchJoinedSessions();
      
      toast({
        title: 'Left Session',
        description: 'You have left the group session'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to leave session',
        variant: 'destructive'
      });
    }
  };

  const fetchSessionParticipants = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_therapy_participants')
        .select('*')
        .eq('session_id', sessionId)
        .is('left_at', null);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
    }
  };

  const startSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_therapy_sessions')
        .update({ started_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchAvailableSessions();
      
      toast({
        title: 'Session Started',
        description: 'The group therapy session has begun!'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to start session',
        variant: 'destructive'
      });
    }
  };

  const endSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_therapy_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchAvailableSessions();
      setCurrentSession(null);
      
      toast({
        title: 'Session Ended',
        description: 'The group therapy session has ended'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive'
      });
    }
  };

  const getSessionsByTopic = (topic: string) => {
    return sessions.filter(session => 
      session.topic_focus.includes(topic)
    );
  };

  const getActiveJoinedSessions = () => {
    return joinedSessions.filter(session => 
      !session.ended_at && session.started_at
    );
  };

  return {
    sessions,
    joinedSessions,
    currentSession,
    participants,
    loading,
    sessionTopics,
    fetchAvailableSessions,
    fetchJoinedSessions,
    createSession,
    joinSession,
    leaveSession,
    fetchSessionParticipants,
    startSession,
    endSession,
    setCurrentSession,
    getSessionsByTopic,
    getActiveJoinedSessions
  };
};