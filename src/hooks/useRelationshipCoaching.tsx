import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RelationshipSession {
  id: string;
  user_id: string;
  session_type: 'communication' | 'conflict_resolution' | 'empathy_building' | 'couples_exercise';
  partner_involved: boolean;
  session_data: any;
  roleplay_scenario?: string;
  ai_feedback: any;
  improvement_areas: string[];
  exercises_completed: any[];
  effectiveness_rating?: number;
  duration_minutes?: number;
  completed_at?: string;
  created_at: string;
}

export const useRelationshipCoaching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<RelationshipSession[]>([]);
  const [currentSession, setCurrentSession] = useState<RelationshipSession | null>(null);
  const [loading, setLoading] = useState(false);

  const sessionTypes = {
    communication: {
      title: 'Communication Skills',
      description: 'Learn effective communication techniques for healthier relationships',
      scenarios: [
        'Expressing needs without blame',
        'Active listening practice',
        'Handling difficult conversations',
        'Non-violent communication'
      ]
    },
    conflict_resolution: {
      title: 'Conflict Resolution',
      description: 'Develop skills to resolve disagreements constructively',
      scenarios: [
        'Finding common ground',
        'De-escalation techniques',
        'Compromise and negotiation',
        'Forgiveness practices'
      ]
    },
    empathy_building: {
      title: 'Empathy Building',
      description: 'Strengthen your ability to understand and connect with others',
      scenarios: [
        'Perspective-taking exercises',
        'Emotional validation practice',
        'Reading emotional cues',
        'Compassionate responding'
      ]
    },
    couples_exercise: {
      title: 'Couples Exercises',
      description: 'Interactive exercises for partners to do together',
      scenarios: [
        'Gratitude sharing',
        'Future planning discussions',
        'Love language exploration',
        'Trust-building activities'
      ]
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('relationship_coaching_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch coaching sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (
    sessionType: 'communication' | 'conflict_resolution' | 'empathy_building' | 'couples_exercise',
    partnerInvolved: boolean = false,
    scenario?: string
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const sessionData = {
        started_at: new Date().toISOString(),
        scenario: scenario || sessionTypes[sessionType].scenarios[0],
        progress: 0,
        current_exercise: 0
      };

      const { data, error } = await supabase
        .from('relationship_coaching_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          partner_involved: partnerInvolved,
          session_data: sessionData,
          roleplay_scenario: scenario,
          ai_feedback: {},
          improvement_areas: [],
          exercises_completed: []
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      
      toast({
        title: 'Session Started',
        description: `Starting ${sessionTypes[sessionType].title} session`
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to start coaching session',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSessionProgress = async (
    sessionId: string,
    exerciseData: any,
    aiFeedback?: any
  ) => {
    if (!user) return;

    try {
      const session = sessions.find(s => s.id === sessionId) || currentSession;
      if (!session) return;

      const updatedExercises = [...session.exercises_completed, exerciseData];
      const progress = Math.min(100, (updatedExercises.length / 5) * 100); // Assume 5 exercises per session

      const { error } = await supabase
        .from('relationship_coaching_sessions')
        .update({
          session_data: {
            ...session.session_data,
            progress,
            current_exercise: updatedExercises.length
          },
          exercises_completed: updatedExercises,
          ai_feedback: aiFeedback || session.ai_feedback
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchSessions();
      
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession({ ...currentSession, exercises_completed: updatedExercises });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update session progress',
        variant: 'destructive'
      });
    }
  };

  const completeSession = async (
    sessionId: string,
    effectivenessRating: number,
    improvementAreas: string[] = []
  ) => {
    if (!user) return;

    try {
      const session = sessions.find(s => s.id === sessionId) || currentSession;
      const startTime = session ? new Date(session.created_at) : new Date();
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('relationship_coaching_sessions')
        .update({
          effectiveness_rating: effectivenessRating,
          improvement_areas: improvementAreas,
          duration_minutes: durationMinutes,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentSession(null);
      await fetchSessions();
      
      toast({
        title: 'Session Completed',
        description: `Great work! You completed a ${durationMinutes}-minute coaching session.`
      });

      // Generate personalized feedback
      await generateAIFeedback(sessionId, effectivenessRating, improvementAreas);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to complete session',
        variant: 'destructive'
      });
    }
  };

  const generateAIFeedback = async (
    sessionId: string,
    rating: number,
    areas: string[]
  ) => {
    try {
      // Simulate AI feedback generation
      const feedback = {
        strengths: rating >= 4 
          ? ['Great engagement with exercises', 'Shows commitment to improvement', 'Good self-reflection']
          : ['Participated in all exercises', 'Shows willingness to learn'],
        
        recommendations: areas.length > 0
          ? areas.map(area => `Focus on improving ${area} in future sessions`)
          : ['Continue practicing these skills in daily interactions'],
        
        next_steps: [
          'Practice techniques learned in real situations',
          'Schedule follow-up session in 1 week',
          'Try partner exercises if applicable'
        ],
        
        generated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('relationship_coaching_sessions')
        .update({ ai_feedback: feedback })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error generating AI feedback:', error);
    }
  };

  const getSessionStats = () => {
    const completed = sessions.filter(s => s.completed_at).length;
    const totalMinutes = sessions
      .filter(s => s.duration_minutes)
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    
    const avgEffectiveness = sessions
      .filter(s => s.effectiveness_rating)
      .reduce((sum, s, _, arr) => sum + (s.effectiveness_rating || 0) / arr.length, 0);

    const improvementAreas = sessions
      .flatMap(s => s.improvement_areas)
      .reduce((acc, area) => {
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      completedSessions: completed,
      totalMinutes,
      averageEffectiveness: Math.round(avgEffectiveness * 10) / 10,
      topImprovementAreas: Object.entries(improvementAreas)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([area]) => area)
    };
  };

  const getRecommendedExercises = (sessionType: string) => {
    const typeData = sessionTypes[sessionType as keyof typeof sessionTypes];
    return typeData ? typeData.scenarios : [];
  };

  return {
    sessions,
    currentSession,
    loading,
    sessionTypes,
    fetchSessions,
    startSession,
    updateSessionProgress,
    completeSession,
    generateAIFeedback,
    getSessionStats,
    getRecommendedExercises,
    setCurrentSession
  };
};