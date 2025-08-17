import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const supportedLanguages = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'tr': 'Turkish',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'he': 'Hebrew',
  'th': 'Thai',
  'vi': 'Vietnamese'
};

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context: string;
}

export const useTranslation = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TranslationResult[]>([]);

  const translateText = async (
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto',
    context: 'chat' | 'video' | 'session_notes' = 'chat'
  ): Promise<TranslationResult | null> => {
    if (!text.trim()) return null;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('translation-service', {
        body: {
          text,
          targetLanguage,
          sourceLanguage,
          userId: user?.id,
          context
        }
      });

      if (error) throw error;

      const result: TranslationResult = {
        originalText: data.originalText,
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage,
        targetLanguage: data.targetLanguage,
        context: data.context
      };

      setHistory(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 translations
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTranslationHistory = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('translation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching translation history:', error);
      return [];
    }
  };

  const getSupportedLanguages = () => supportedLanguages;

  const getLanguageName = (code: string) => supportedLanguages[code as keyof typeof supportedLanguages] || code;

  const detectLanguage = async (text: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('translation-service', {
        body: {
          text,
          targetLanguage: 'en', // dummy target for detection
          sourceLanguage: 'auto',
          userId: user?.id,
          context: 'detection_only'
        }
      });

      if (error) throw error;
      return data.sourceLanguage;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  };

  const isRTL = (languageCode: string): boolean => {
    const rtlLanguages = ['ar', 'he'];
    return rtlLanguages.includes(languageCode);
  };

  return {
    loading,
    history,
    translateText,
    getTranslationHistory,
    getSupportedLanguages,
    getLanguageName,
    detectLanguage,
    isRTL,
    supportedLanguages
  };
};