import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

// Simple localStorage-based mood tracking until types are updated
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
      // For now, save to localStorage until database types are available
      const moodEntry: MoodEntry = {
        id: crypto.randomUUID(),
        user_id: user.id,
        mood_id: mood.id,
        mood_value: mood.value,
        notes: notes || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const today = new Date().toISOString().split('T')[0];
      const storageKey = `mood_${user.id}_${today}`;
      localStorage.setItem(storageKey, JSON.stringify(moodEntry));
      
      setTodaysMood(moodEntry);
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
      const moods: MoodEntry[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const storageKey = `mood_${user.id}_${dateStr}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          moods.push(JSON.parse(stored));
        }
      }
      return moods.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error fetching mood history:', error);
      return [];
    }
  };

  const checkTodaysMood = () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `mood_${user.id}_${today}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTodaysMood(JSON.parse(stored));
      }
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