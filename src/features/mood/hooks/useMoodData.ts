import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface MoodEntry {
  id: string;
  mood_value: number;
  tags?: string[];
  notes?: string;
  recorded_at: string;
  created_at: string;
}

interface SaveMoodData {
  mood_value: number;
  tags?: string[];
  notes?: string;
}

export const useMoodData = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  // Get today's mood
  const { data: todaysMood } = useQuery({
    queryKey: ['mood', 'today', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('moods' as any)
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', today)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return (data as any) as MoodEntry | null;
    },
    enabled: !!user
  });

  // Get mood history
  const { data: moodHistory } = useQuery({
    queryKey: ['mood', 'history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('moods' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return (data as any) as MoodEntry[];
    },
    enabled: !!user
  });

  // Calculate weekly average
  const weeklyAverage = moodHistory ? 
    (() => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyMoods = moodHistory.filter(mood => 
        new Date(mood.recorded_at) >= weekAgo
      );
      
      if (weeklyMoods.length === 0) return null;
      
      return weeklyMoods.reduce((sum, mood) => sum + mood.mood_value, 0) / weeklyMoods.length;
    })()
    : null;

  // Save mood mutation
  const saveMoodMutation = useMutation({
    mutationFn: async (moodData: SaveMoodData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('moods' as any)
        .insert({
          user_id: user.id,
          mood_value: moodData.mood_value,
          tags: moodData.tags || [],
          notes: moodData.notes,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return (data as any) as MoodEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood'] });
      toast.success('Humör sparat!');
    },
    onError: (error) => {
      console.error('Failed to save mood:', error);
      toast.error('Kunde inte spara humör');
    }
  });

  return {
    todaysMood,
    moodHistory,
    weeklyAverage,
    saveMood: saveMoodMutation.mutate,
    isLoading: saveMoodMutation.isPending
  };
};