import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  ai_tone?: string;
  onboarding_completed?: boolean;
  auri_enabled?: boolean;
  auri_tone?: string;
  intention?: string;
}

const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);

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
        setPreferences({
          theme: data.theme_preference as 'light' | 'dark' | 'auto' || 'light',
          language: data.language_preference || 'en',
          ai_tone: data.ai_tone,
          onboarding_completed: data.onboarding_completed,
          auri_enabled: data.auri_enabled,
          auri_tone: data.auri_tone,
          intention: data.intention
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load user preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme_preference: updates.theme || preferences.theme,
          language_preference: updates.language || preferences.language,
          ai_tone: updates.ai_tone,
          onboarding_completed: updates.onboarding_completed,
          auri_enabled: updates.auri_enabled,
          auri_tone: updates.auri_tone,
          intention: updates.intention,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      setPreferences(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [user]);

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <div>
        {children}
      </div>
    </Suspense>
  );
};

export { UserPreferencesProvider };