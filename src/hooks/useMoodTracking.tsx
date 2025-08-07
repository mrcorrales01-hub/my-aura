import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface Mood {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  value: number; // 1-5 scale for analytics
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_id: string;
  mood_value: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useMoodTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);

  const saveMood = async (mood: Mood, notes?: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your mood",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    try {
      // Check if mood already exists for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingMood } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .single();

      let result;
      if (existingMood) {
        // Update existing mood
        result = await supabase
          .from('mood_entries')
          .update({
            mood_id: mood.id,
            mood_value: mood.value,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingMood.id)
          .select()
          .single();
      } else {
        // Create new mood entry
        result = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            mood_id: mood.id,
            mood_value: mood.value,
            notes: notes || null
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setTodaysMood(result.data);
      toast({
        title: "Mood saved",
        description: "Your mood has been recorded successfully"
      });
      return true;
    } catch (error) {
      console.error('Error saving mood:', error);
      toast({
        title: "Error",
        description: "Failed to save mood. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  const checkTodaysMood = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .lt('created_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setTodaysMood(data);
    } catch (error) {
      console.error('Error checking today\'s mood:', error);
    }
  };

  useEffect(() => {
    if (user) {
      checkTodaysMood();
    }
  }, [user]);

  return {
    saveMood,
    getMoodHistory,
    loading,
    todaysMood,
    hasMoodToday: !!todaysMood
  };
};