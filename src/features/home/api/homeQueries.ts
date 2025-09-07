import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Types
export interface MoodEntry {
  id: string;
  mood_value: number;
  created_at: string;
  recorded_at: string;
  tags?: string[];
  notes?: string;
}

export interface JournalEntry {
  id: string;
  title?: string;
  created_at: string;
}

export interface PlanTask {
  id: string;
  title: string;
  done: boolean;
  order_index: number;
}

export interface Plan {
  id: string;
  title: string;
  created_at: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration_seconds: number;
}

// Hooks
export const useMoodHistory = (days: number = 7) => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['mood-history', user?.id, days],
    queryFn: async () => {
      if (!user) return [];

      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      const sevenDaysAgoISO = daysAgo.toISOString();

      const { data, error } = await supabase
        .from('moods' as any)
        .select('id, mood_value, created_at, recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', sevenDaysAgoISO)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return (data as any) as MoodEntry[];
    },
    enabled: !!user,
  });
};

export const useRecentJournalEntries = (limit: number = 3) => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['recent-journal', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('journal_entries' as any)
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as any) as JournalEntry[];
    },
    enabled: !!user,
  });
};

export const useActivePlan = () => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['active-plan', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('plans' as any)
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as any) as Plan | null;
    },
    enabled: !!user,
  });
};

export const useTodayTasks = (planId?: string) => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ['today-tasks', planId],
    queryFn: async () => {
      if (!user || !planId) return [];

      const { data, error } = await supabase
        .from('plan_tasks' as any)
        .select('id, title, done, order_index')
        .eq('plan_id', planId)
        .order('order_index', { ascending: true })
        .limit(5);

      if (error) throw error;
      return (data as any) as PlanTask[];
    },
    enabled: !!user && !!planId,
  });
};

export const useSuggestedExercise = () => {
  return useQuery({
    queryKey: ['suggested-exercise'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises' as any)
        .select('id, title, description, duration_seconds')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return (data as any) as Exercise | null;
    },
  });
};

// Mutations
export const useSaveMood = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moodData: { mood_value: number; tags?: string[]; notes?: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('moods' as any)
        .insert({
          user_id: user.id,
          mood_value: moodData.mood_value,
          tags: moodData.tags || [],
          notes: moodData.notes,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-history'] });
      toast.success('Mood saved successfully');
    },
    onError: (error) => {
      console.error('Failed to save mood:', error);
      toast.error('Failed to save mood');
    },
  });
};

export const useToggleTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, done }: { taskId: string; done: boolean }) => {
      const { data, error } = await supabase
        .from('plan_tasks' as any)
        .update({ done })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ taskId, done }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['today-tasks'] });
      
      const previousTasks = queryClient.getQueryData(['today-tasks']);
      
      queryClient.setQueryData(['today-tasks'], (old: any) => {
        if (!old) return old;
        return old.map((task: PlanTask) => 
          task.id === taskId ? { ...task, done } : task
        );
      });

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['today-tasks'], context.previousTasks);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['today-tasks'] });
    },
  });
};