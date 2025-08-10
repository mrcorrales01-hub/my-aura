import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';

interface AuriProps {
  message?: string;
  onDismiss?: () => void;
  showSettings?: boolean;
  context?: 'mood' | 'relationship' | 'general' | 'welcome';
}

const Auri = ({ message, onDismiss, showSettings = false, context = 'general' }: AuriProps) => {
  const [auriEnabled, setAuriEnabled] = useState(true);
  const [auriTone, setAuriTone] = useState('soothing');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      loadAuriPreferences();
    }
  }, [user]);

  const loadAuriPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('auri_enabled, auri_tone')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setAuriEnabled(data.auri_enabled ?? true);
        setAuriTone(data.auri_tone ?? 'soothing');
      }
    } catch (error) {
      console.error('Error loading Auri preferences:', error);
    }
  };

  const updateAuriPreferences = async (enabled: boolean, tone?: string) => {
    if (!user) return;

    try {
      const updateData: any = { auri_enabled: enabled };
      if (tone) updateData.auri_tone = tone;

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...updateData,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating Auri preferences:', error);
    }
  };

  const toggleAuri = () => {
    const newEnabled = !auriEnabled;
    setAuriEnabled(newEnabled);
    updateAuriPreferences(newEnabled);
  };

  const getAuriPersonality = () => {
    const personalities = t('auri.personalities') as any;
    const personality = personalities?.[auriTone] || personalities?.soothing || {};
    
    switch (auriTone) {
      case 'playful':
        return {
          ...personality,
          color: 'text-coral',
          bgColor: 'bg-gradient-to-br from-coral/20 to-wellness-secondary/20',
          animation: 'animate-bounce'
        };
      case 'professional':
        return {
          ...personality,
          color: 'text-calm',
          bgColor: 'bg-gradient-to-br from-calm/20 to-wellness-primary/20',
          animation: 'animate-pulse'
        };
      default: // soothing
        return {
          ...personality,
          color: 'text-wellness-primary',
          bgColor: 'bg-gradient-wellness',
          animation: 'animate-float'
        };
    }
  };

  const getContextualMessage = () => {
    if (message) return message;
    
    const contextMessages = t('auri.contextMessages') as any;
    const personalities = t('auri.personalities') as any;
    const basePersonality = personalities?.[auriTone] || personalities?.soothing;
    
    // Return context-specific message (first option) or personality-specific welcome (first), with a safe fallback
    const contextArray = contextMessages?.[context];
    return (Array.isArray(contextArray) && contextArray[0])
      ? contextArray[0]
      : (basePersonality?.welcomeMessages?.[0] || t('common.hello'));
  };

  if (!auriEnabled) return null;

  const personality = getAuriPersonality();
  const displayMessage = getContextualMessage();

  if (!displayMessage) return null;

  return (
    <Card className={`fixed bottom-6 right-6 max-w-sm p-4 shadow-wellness ${personality.bgColor} border-2 border-wellness-primary/20 z-50`}>
      <div className="flex items-start space-x-3">
        <div className={`text-2xl ${personality.animation}`}>
          {personality.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${personality.color}`}>{t('auri.name')}</h4>
            <div className="flex space-x-1">
              {showSettings && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAuri}
                  className="h-6 w-6 p-0"
                  title={t('auri.settings.title')}
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0"
                  title={t('common.close')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          {isLoading ? (
            <p className="text-sm text-foreground/60 italic">{t('auri.messages.loading')}</p>
          ) : (
            <p className="text-sm text-foreground/80">{displayMessage}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Auri;