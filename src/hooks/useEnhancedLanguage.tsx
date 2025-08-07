import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Language = 'en' | 'es' | 'zh' | 'hi' | 'ar' | 'pt' | 'bn' | 'ru' | 'ja' | 'pa' | 'de' | 'fr' | 'tr' | 'vi' | 'ko' | 'it' | 'ur' | 'fa' | 'sw' | 'tl' | 'sv' | 'no';

interface EnhancedLanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string, replacements?: Record<string, string>) => string;
  loading: boolean;
}

const EnhancedLanguageContext = createContext<EnhancedLanguageContextType | undefined>(undefined);

interface EnhancedLanguageProviderProps {
  children: ReactNode;
}

export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  zh: { name: '简体中文', flag: '🇨🇳' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  pt: { name: 'Português', flag: '🇧🇷' },
  bn: { name: 'বাংলা', flag: '🇧🇩' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  pa: { name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'Français', flag: '🇫🇷' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  ko: { name: '한국어', flag: '🇰🇷' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  ur: { name: 'اردو', flag: '🇵🇰' },
  fa: { name: 'فارسی', flag: '🇮🇷' },
  sw: { name: 'Kiswahili', flag: '🇰🇪' },
  tl: { name: 'Filipino', flag: '🇵🇭' },
  sv: { name: 'Svenska', flag: '🇸🇪' },
  no: { name: 'Norsk', flag: '🇳🇴' }
};

export const EnhancedLanguageProvider = ({ children }: EnhancedLanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load language from user preferences or localStorage
  useEffect(() => {
    const loadLanguage = async () => {
      setLoading(true);
      
      if (user) {
        try {
          // Load from user preferences
          const { data } = await supabase
            .from('user_preferences')
            .select('language_preference')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (data?.language_preference) {
            setCurrentLanguage(data.language_preference as Language);
          } else {
            // Initialize with localStorage value if no DB preference
            const savedLanguage = localStorage.getItem('aura-language') as Language;
            if (savedLanguage && savedLanguage in languages) {
              setCurrentLanguage(savedLanguage);
              // Save to database for future sync
              await saveLanguageToDatabase(savedLanguage);
            }
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
          // Fallback to localStorage
          const savedLanguage = localStorage.getItem('aura-language') as Language;
          if (savedLanguage && savedLanguage in languages) {
            setCurrentLanguage(savedLanguage);
          }
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedLanguage = localStorage.getItem('aura-language') as Language;
        if (savedLanguage && savedLanguage in languages) {
          setCurrentLanguage(savedLanguage);
        }
      }
      
      setLoading(false);
    };

    loadLanguage();
  }, [user]);

  const saveLanguageToDatabase = async (language: Language) => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          language_preference: language,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving language to database:', error);
    }
  };

  const setLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    
    // Always save to localStorage for immediate persistence
    localStorage.setItem('aura-language', language);
    
    if (user) {
      try {
        await saveLanguageToDatabase(language);
        toast({
          title: 'Language updated',
          description: `Language changed to ${languages[language].name}`,
        });
      } catch (error) {
        toast({
          title: 'Warning',
          description: 'Language changed locally but failed to sync to cloud',
          variant: 'destructive'
        });
      }
    } else {
      toast({
        title: 'Language updated',
        description: `Language changed to ${languages[language].name}`,
      });
    }
  };

  const t = (key: string, replacements?: Record<string, string>): string => {
    // This would use the same translation logic as before
    // For now, returning the key as fallback
    return key;
  };

  return (
    <EnhancedLanguageContext.Provider value={{ 
      currentLanguage, 
      setLanguage, 
      t, 
      loading 
    }}>
      {children}
    </EnhancedLanguageContext.Provider>
  );
};

export const useEnhancedLanguage = () => {
  const context = useContext(EnhancedLanguageContext);
  if (!context) {
    throw new Error('useEnhancedLanguage must be used within an EnhancedLanguageProvider');
  }
  return context;
};