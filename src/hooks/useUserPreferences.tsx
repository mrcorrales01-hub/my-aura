import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserPreferences {
  theme_preference?: string;
  language_preference?: Language;
  ai_tone?: string;
  auri_tone?: string;
  auri_enabled?: boolean;
  intention?: string;
  onboarding_completed?: boolean;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const { toast } = useToast();

  // Load preferences from database
  const loadPreferences = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data as UserPreferences);
        
        // Apply theme and language automatically
        if (data.theme_preference) {
          setTheme(data.theme_preference as 'light' | 'dark' | 'auto');
        }
        if (data.language_preference) {
          setLanguage(data.language_preference as Language);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save preferences to database
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to save preferences',
          variant: 'destructive'
        });
        return;
      }

      setPreferences(prev => ({ ...prev, ...updates }));
      
      // Apply changes immediately
      if (updates.theme_preference) {
        setTheme(updates.theme_preference as 'light' | 'dark' | 'auto');
      }
      if (updates.language_preference) {
        setLanguage(updates.language_preference);
      }

      toast({
        title: 'Success',
        description: 'Preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    loadPreferences
  };
};