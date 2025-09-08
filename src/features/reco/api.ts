import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface Exercise {
  id: string;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  duration_seconds: number;
  tags: string[];
  created_at: string;
}

export interface ExerciseSession {
  id: string;
  user_id: string;
  exercise_id: string;
  completed_at: string;
  created_at: string;
}

export interface MoodData {
  id: string;
  mood_value: number;
  mood_id: string;
  notes?: string;
  created_at: string;
}

// Helper function to map mood data to exercise intents
export const getMoodIntents = (moods: MoodData[]): string[] => {
  if (!moods.length) return ['breathing', 'grounding']; // Default fallback

  const avgScore = moods.reduce((sum, mood) => sum + mood.mood_value, 0) / moods.length;
  const recentMoods = moods.slice(0, 5); // Last 5 mood entries
  
  const intents: string[] = [];
  
  // Map mood patterns to exercise intents based on mood values and notes
  if (avgScore <= 4) {
    intents.push('breathing', 'grounding');
  }
  
  if (avgScore <= 3) {
    intents.push('breathing', 'grounding', 'reflect');
  }
  
  // Check for stress indicators in notes
  const allNotes = moods.map(mood => mood.notes?.toLowerCase() || '').join(' ');
  if (allNotes.includes('stress') || allNotes.includes('anxious') || allNotes.includes('tension')) {
    intents.push('breathing', 'body', 'micro-move');
  }
  
  if (avgScore >= 7) {
    intents.push('gratitude', 'calm', 'micro-move');
  }
  
  if (avgScore >= 6 && avgScore < 7) {
    intents.push('breathing', 'calm');
  }
  
  // Default if no specific patterns
  if (intents.length === 0) {
    intents.push('breathing', 'calm');
  }
  
  return Array.from(new Set(intents)); // Remove duplicates
};

// Hooks
export const useRecommendedExercises = () => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['recommended-exercises', user?.id],
    queryFn: async () => {
      // Get mood data from last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      let intents: string[] = ['breathing', 'grounding']; // Default

      if (user) {
        const { data: moodData, error: moodError } = await supabase
          .from('mood_entries')
          .select('id, mood_value, mood_id, notes, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgoISO)
          .order('created_at', { ascending: false });

        if (!moodError && moodData?.length) {
          intents = getMoodIntents(moodData);
        }
      }

      // Get exercises that match our intents
      const { data: exercises, error } = await supabase
        .from('exercises')
        .select('id, slug, title, description, duration_seconds, tags, created_at')
        .overlaps('tags', intents)
        .limit(2);

      if (error) {
        console.error('Error fetching exercises:', error);
        
        // Fallback: get any 2 exercises
        const { data: fallbackExercises, error: fallbackError } = await supabase
          .from('exercises')
          .select('id, slug, title, description, duration_seconds, tags, created_at')
          .limit(2);
        
        if (fallbackError) throw fallbackError;
        return (fallbackExercises as Exercise[]) || [];
      }

      return (exercises as Exercise[]) || [];
    },
    enabled: true, // Always enabled, works for both authenticated and anonymous users
  });
};

export const useExerciseBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['exercise', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, slug, title, description, duration_seconds, tags, created_at')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Exercise | null;
    },
    enabled: !!slug,
  });
};

export const useLogExerciseSession = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exerciseId: string) => {
      if (!user) {
        // For anonymous users, just show success without logging
        return { id: 'anonymous', exercise_id: exerciseId };
      }

      const { data, error } = await supabase
        .from('exercise_sessions')
        .insert({
          user_id: user.id,
          exercise_id: exerciseId,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as ExerciseSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-sessions'] });
      toast.success('Exercise completed!');
    },
    onError: (error) => {
      console.error('Failed to log exercise session:', error);
      toast.error('Failed to log exercise');
    },
  });
};

export const useUserExerciseSessions = (limit: number = 10) => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['exercise-sessions', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('exercise_sessions')
        .select(`
          id,
          exercise_id,
          completed_at,
          created_at,
          exercises:exercise_id (
            slug,
            title,
            duration_seconds
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as (ExerciseSession & { exercises: Pick<Exercise, 'slug' | 'title' | 'duration_seconds'> })[];
    },
    enabled: !!user,
  });
};