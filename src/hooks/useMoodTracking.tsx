import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface MoodEntry {
  id: string;
  mood_id: string;
  mood_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMoodTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getMoodHistory = async (days: number = 30): Promise<MoodEntry[]> => {
    if (!user) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mood history:', error);
      return [];
    }
  };

  const saveMoodEntry = async (moodId: string, moodValue: number, notes?: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_id: moodId,
          mood_value: moodValue,
          notes: notes?.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Mood logged!',
        description: 'Thank you for checking in.',
      });

      return true;
    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your mood. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getMoodHistory,
    saveMoodEntry,
    isLoading,
  };
};